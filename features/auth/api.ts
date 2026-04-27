import { apiFetch } from "@/lib/api";

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export async function signIn(payload: AuthPayload) {
  return apiFetch("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signUp(payload: AuthPayload) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
