import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `session=${sessionCookie.value}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { user: AuthUser };
  return body.user;
}
