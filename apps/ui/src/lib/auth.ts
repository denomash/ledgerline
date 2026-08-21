import { apiFetch } from "@/lib/api";
import type { AuthUser, LogInInput, SignUpInput } from "@/models/authInterface";

export function signUp(input: SignUpInput) {
  return apiFetch<{ user: AuthUser }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logIn(input: LogInInput) {
  return apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
