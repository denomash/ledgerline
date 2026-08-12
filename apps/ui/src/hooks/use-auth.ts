import { useMutation } from "@tanstack/react-query";
import { logIn, signUp } from "@/lib/auth";

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}

export function useLogIn() {
  return useMutation({ mutationFn: logIn });
}
