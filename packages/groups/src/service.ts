import { prisma, Prisma, type Membership } from "@ledgerline/db";
import { ConflictError, NotFoundError } from "@ledgerline/shared";
import type { InviteMemberInput } from "./types.js";

const SOURCE = "GroupsService";

export async function inviteMember(groupId: string, input: InviteMemberInput): Promise<Membership> {
  const invitee = await prisma.user.findUnique({ where: { email: input.email } });
  if (!invitee) {
    throw new NotFoundError(SOURCE, "No account found with that email", { email: input.email });
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: invitee.id, groupId } },
  });
  if (existing) {
    throw new ConflictError(SOURCE, "User is already a member of this group", {
      userId: invitee.id,
      groupId,
    });
  }

  return prisma.membership
    .create({
      data: { userId: invitee.id, groupId, role: input.role ?? "MEMBER", status: "INVITED" },
    })
    .catch((err) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictError(
          SOURCE,
          "User is already a member of this group",
          { userId: invitee.id, groupId },
          err,
        );
      }
      throw err;
    });
}

export async function joinGroup(groupId: string, userId: string): Promise<Membership> {
  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!membership || membership.status !== "INVITED") {
    throw new NotFoundError(SOURCE, "No pending invite found for this group", { userId, groupId });
  }

  return prisma.membership.update({
    where: { id: membership.id },
    data: { status: "ACTIVE" },
  });
}
