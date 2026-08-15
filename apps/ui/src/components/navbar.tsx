import { BookOpenText } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <BookOpenText className="size-5" />
          Ledgerline
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
