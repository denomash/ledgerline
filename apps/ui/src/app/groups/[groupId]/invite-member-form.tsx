"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api";

export function InviteMemberForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const invite = useMutation({
    mutationFn: (email: string) =>
      apiFetch(`/groups/${groupId}/invite`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    invite.mutate(email, {
      onSuccess: () => {
        toast.success("Invite sent");
        formRef.current?.reset();
        router.refresh();
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Something went wrong");
      },
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <Input name="email" type="email" placeholder="Email to invite" required />
      <Button type="submit" disabled={invite.isPending}>
        {invite.isPending ? "Inviting..." : "Invite"}
      </Button>
    </form>
  );
}
