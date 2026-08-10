import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@ledgerline/db";
import { createJwtService } from "@ledgerline/jwt";
import { EmailInUseError, InvalidCredentialsError, signIn, signUp, toPublicUser } from "./service.js";
import type { AuthPluginOptions } from "./types.js";

const signUpSchema = {
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", minLength: 1 },
      email: { type: "string", minLength: 3 },
      phone: { type: "string" },
      password: { type: "string", minLength: 8 },
    },
  },
};

const signInSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 1 },
    },
  },
};

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, opts) => {
  const cookieName = opts.cookieName ?? "session";
  const jwtService = createJwtService({ secret: opts.jwtSecret, expiresIn: opts.jwtExpiresIn ?? "7d" });
  const cookieOptions = { httpOnly: true, sameSite: "lax" as const, path: "/" };

  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies[cookieName];
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    try {
      const payload = jwtService.verify(token);
      request.user = { id: payload.sub };
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  fastify.post<{ Body: { name: string; email: string; phone?: string; password: string } }>(
    "/auth/signup",
    { schema: signUpSchema },
    async (request, reply) => {
      try {
        const { user, token } = await signUp(jwtService, request.body);
        reply.setCookie(cookieName, token, cookieOptions);
        return { user: toPublicUser(user) };
      } catch (err) {
        if (err instanceof EmailInUseError) {
          return reply.code(409).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  fastify.post<{ Body: { email: string; password: string } }>(
    "/auth/login",
    { schema: signInSchema },
    async (request, reply) => {
      try {
        const { user, token } = await signIn(jwtService, request.body);
        reply.setCookie(cookieName, token, cookieOptions);
        return { user: toPublicUser(user) };
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return reply.code(401).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  fastify.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie(cookieName, { path: "/" });
    return { ok: true };
  });

  fastify.get("/auth/me", { preHandler: fastify.authenticate }, async (request) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.user!.id } });
    return { user: toPublicUser(user) };
  });
};

export default fp(authPlugin, { name: "auth" });
