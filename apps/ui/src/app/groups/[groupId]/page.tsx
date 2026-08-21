import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth-server";
import { getGroupMembers } from "@/lib/groups-server";
import { InviteMemberForm } from "./invite-member-form";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { groupId } = await params;
  const members = await getGroupMembers(groupId);
  if (!members) {
    notFound();
  }

  const isAdmin = members.some((member) => member.user.id === user.id && member.role === "ADMIN");

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-4">
      <h1 className="mb-4 text-2xl font-semibold">Members</h1>
      {isAdmin && <InviteMemberForm groupId={groupId} />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>{member.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={member.status === "ACTIVE" ? "outline" : "secondary"}>{member.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
