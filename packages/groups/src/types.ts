import type { MembershipRole } from "@ledgerline/db";
// Pulls in @ledgerline/authentication's module augmentation (fastify.authenticate,
// request.user) so this package type-checks standalone without depending on its runtime code.
import type {} from "@ledgerline/authentication";

export interface InviteMemberInput {
  email: string;
  role?: MembershipRole;
}
