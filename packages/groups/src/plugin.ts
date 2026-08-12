import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { prisma } from "@ledgerline/db";
import { ForbiddenError } from "@ledgerline/shared";
import { inviteMember, joinGroup } from "./service.js";
import "./types.js";

const SOURCE = "GroupsService";

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

async function requireGroupAdmin(request: FastifyRequest<GroupParams>) {
  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: request.user!.id, groupId: request.params.groupId } },
  });
  if (!membership || membership.status !== "ACTIVE" || membership.role !== "ADMIN") {
    throw new ForbiddenError(SOURCE, "Forbidden");
  }
}

const groupsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.post<GroupParams & { Body: { email: string; role?: "MEMBER" | "ADMIN" } }>(
    "/groups/:groupId/invite",
    { schema: inviteSchema, preHandler: [fastify.authenticate, requireGroupAdmin] },
    async (request) => {
      const membership = await inviteMember(request.params.groupId, request.body);
      return { membership };
    },
  );

  fastify.post<GroupParams>(
    "/groups/:groupId/join",
    { preHandler: fastify.authenticate },
    async (request) => {
      const membership = await joinGroup(request.params.groupId, request.user!.id);
      return { membership };
    },
  );
};

export default fp(groupsPlugin, { name: "groups" });
