import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold">Ledgerline</h1>
    </div>
  );
}
