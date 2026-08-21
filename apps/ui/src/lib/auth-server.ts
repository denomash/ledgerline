import { cache } from "react";
import { cookies } from "next/headers";
import type { AuthUser } from "@/models/authInterface";
import { API_URL } from "@/lib/env";

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
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
});
