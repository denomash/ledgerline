import { prisma, type Membership } from "@ledgerline/db";
import type { InviteMemberInput } from "./types.js";

export class UserNotFoundError extends Error {
  constructor() {
    super("No account found with that email");
  }
}

export class AlreadyMemberError extends Error {
  constructor() {
    super("User is already a member of this group");
  }
}

export class InviteNotFoundError extends Error {
  constructor() {
    super("No pending invite found for this group");
  }
}

export async function inviteMember(groupId: string, input: InviteMemberInput): Promise<Membership> {
  const invitee = await prisma.user.findUnique({ where: { email: input.email } });
  if (!invitee) {
    throw new UserNotFoundError();
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: invitee.id, groupId } },
  });
  if (existing) {
    throw new AlreadyMemberError();
  }

  return prisma.membership.create({
    data: { userId: invitee.id, groupId, role: input.role ?? "MEMBER", status: "INVITED" },
  });
}

export async function joinGroup(groupId: string, userId: string): Promise<Membership> {
  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!membership || membership.status !== "INVITED") {
    throw new InviteNotFoundError();
  }

  return prisma.membership.update({
    where: { id: membership.id },
    data: { status: "ACTIVE" },
  });
}
