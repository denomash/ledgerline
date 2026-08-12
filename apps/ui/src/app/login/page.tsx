import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { LogInForm } from "./login-form";

export default async function LogInPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return <LogInForm />;
}
