/** Persist JWT from sign-in / sign-up API responses for client-side API calls. */
export function persistAuthSession(data: unknown) {
  if (!data || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const token =
    typeof d.access_token === "string"
      ? d.access_token
      : typeof d.token === "string"
        ? d.token
        : null;
  if (token) {
    try {
      localStorage.setItem("access_token", token);
    } catch {
      /* storage unavailable */
    }
  }
}
