import type { User } from "@ledgerline/db";
import type { JwtServiceConfig } from "@ledgerline/jwt";
// Pulls in @fastify/cookie's module augmentation (request.cookies, reply.setCookie/clearCookie)
// so this package type-checks standalone, not just when apps/api happens to import it too.
import type {} from "@fastify/cookie";

export interface SignUpInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface AuthPluginOptions {
  jwtSecret: string;
  jwtExpiresIn?: JwtServiceConfig["expiresIn"];
  cookieName?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string };
  }
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}
