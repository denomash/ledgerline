"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { PasswordInput } from "@/components/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";

export function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const phone = (formData.get("phone") as string).trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }
    setConfirmError(null);

    signUp.mutate(
      {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password,
        ...(phone && { phone }),
      },
      {
        onSuccess: () => {
          toast.success("Account created");
          router.push("/");
          router.refresh();
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : "Something went wrong";
          toast.error(message);
          setError(message);
        },
      },
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} onChange={() => setError(null)}>
          <CardContent className="flex flex-col gap-4 pb-3">
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" minLength={8} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                minLength={8}
                required
                aria-invalid={confirmError ? true : undefined}
                onChange={() => setConfirmError(null)}
              />
              {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4 pt-3">
            <Button type="submit" disabled={signUp.isPending}>
              {signUp.isPending ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
