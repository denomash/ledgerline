import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@ledgerline/db";
import {
  AlreadyMemberError,
  InviteNotFoundError,
  UserNotFoundError,
  inviteMember,
  joinGroup,
} from "./service.js";
import "./types.js";

const inviteSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", minLength: 3 },
      role: { type: "string", enum: ["MEMBER", "ADMIN"] },
    },
  },
};

type GroupParams = { Params: { groupId: string } };

async function requireGroupAdmin(request: FastifyRequest<GroupParams>, reply: FastifyReply) {
  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: request.user!.id, groupId: request.params.groupId } },
  });
  if (!membership || membership.status !== "ACTIVE" || membership.role !== "ADMIN") {
    return reply.code(403).send({ error: "Forbidden" });
  }
}

const groupsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.post<GroupParams & { Body: { email: string; role?: "MEMBER" | "ADMIN" } }>(
    "/groups/:groupId/invite",
    { schema: inviteSchema, preHandler: [fastify.authenticate, requireGroupAdmin] },
    async (request, reply) => {
      try {
        const membership = await inviteMember(request.params.groupId, request.body);
        return { membership };
      } catch (err) {
        if (err instanceof UserNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        if (err instanceof AlreadyMemberError) {
          return reply.code(409).send({ error: err.message });
        }
        throw err;
      }
    },
  );

  fastify.post<GroupParams>(
    "/groups/:groupId/join",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      try {
        const membership = await joinGroup(request.params.groupId, request.user!.id);
        return { membership };
      } catch (err) {
        if (err instanceof InviteNotFoundError) {
          return reply.code(404).send({ error: err.message });
        }
        throw err;
      }
    },
  );
};

export default fp(groupsPlugin, { name: "groups" });
