import { apiFetch } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

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
