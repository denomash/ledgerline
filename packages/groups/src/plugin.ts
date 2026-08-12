import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { prisma, type Membership } from "@ledgerline/db";
import { ForbiddenError } from "@ledgerline/shared";
import { inviteMember, joinGroup, listMembers, listMyGroups } from "./service.js";
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

function findActiveMembership(userId: string, groupId: string): Promise<Membership | null> {
  return prisma.membership.findUnique({ where: { userId_groupId: { userId, groupId } } });
}

async function requireGroupMember(request: FastifyRequest<GroupParams>) {
  const membership = await findActiveMembership(request.user!.id, request.params.groupId);
  if (!membership || membership.status !== "ACTIVE") {
    throw new ForbiddenError(SOURCE, "Forbidden");
  }
}

async function requireGroupAdmin(request: FastifyRequest<GroupParams>) {
  const membership = await findActiveMembership(request.user!.id, request.params.groupId);
  if (!membership || membership.status !== "ACTIVE" || membership.role !== "ADMIN") {
    throw new ForbiddenError(SOURCE, "Forbidden");
  }
}

const groupsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get("/groups", { preHandler: fastify.authenticate }, async (request) => {
    const groups = await listMyGroups(request.user!.id);
    return { groups };
  });

  fastify.get<GroupParams>(
    "/groups/:groupId/members",
    { preHandler: [fastify.authenticate, requireGroupMember] },
    async (request) => {
      const members = await listMembers(request.params.groupId);
      return { members };
    },
  );

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
