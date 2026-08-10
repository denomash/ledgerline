import * as argon2 from "argon2";
import { prisma, Prisma, type User } from "@ledgerline/db";
import type { JwtService } from "@ledgerline/jwt";
import type { AuthResult, SignInInput, SignUpInput } from "./types.js";

export class EmailInUseError extends Error {
  constructor() {
    super("Email is already in use");
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
  }
}

export async function signUp(jwtService: JwtService, input: SignUpInput): Promise<AuthResult> {
  const passwordHash = await argon2.hash(input.password);

  const user = await prisma
    .$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
      });
      const group = await tx.group.create({ data: { name: `${input.name}'s Group` } });
      await tx.membership.create({
        data: { userId: createdUser.id, groupId: group.id, role: "ADMIN" },
      });
      return createdUser;
    })
    .catch((err) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new EmailInUseError();
      }
      throw err;
    });

  return { user, token: jwtService.sign({ sub: user.id }) };
}

export async function signIn(jwtService: JwtService, input: SignInInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
    throw new InvalidCredentialsError();
  }

  return { user, token: jwtService.sign({ sub: user.id }) };
}

export function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
