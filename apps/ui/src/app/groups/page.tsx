import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth-server";
import { getMyGroups } from "@/lib/groups-server";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const groups = await getMyGroups();

  if (groups.length === 1) {
    redirect(`/groups/${groups[0].id}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-4">
      <h1 className="mb-4 text-2xl font-semibold">My groups</h1>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">You&apos;re not part of any group yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{group.name}</CardTitle>
                  <Badge variant={group.role === "ADMIN" ? "default" : "secondary"}>{group.role}</Badge>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
