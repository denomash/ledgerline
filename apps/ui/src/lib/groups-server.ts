import { cache } from "react";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/env";
import type { GroupMember, GroupSummary } from "@/models/groupsInterface";

async function authorizedFetch(path: string): Promise<Response | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) {
    return null;
  }

  return fetch(`${API_URL}${path}`, {
    headers: { Cookie: `session=${sessionCookie.value}` },
    cache: "no-store",
  });
}

export const getMyGroups = cache(async (): Promise<GroupSummary[]> => {
  const response = await authorizedFetch("/groups");
  if (!response || !response.ok) {
    return [];
  }

  const body = (await response.json()) as { groups: GroupSummary[] };
  return body.groups;
});

export const getGroupMembers = cache(async (groupId: string): Promise<GroupMember[] | null> => {
  const response = await authorizedFetch(`/groups/${groupId}/members`);
  if (!response || !response.ok) {
    return null;
  }

  const body = (await response.json()) as { members: GroupMember[] };
  return body.members;
});
