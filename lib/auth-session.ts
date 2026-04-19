/** Extract JWT string from sign-in / sign-up API responses (supports common Nest shapes). */
export function extractAccessToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const inner =
    d.data !== undefined && typeof d.data === "object" && d.data !== null
      ? (d.data as Record<string, unknown>)
      : null;

  const token =
    (typeof d.access_token === "string" && d.access_token) ||
    (inner && typeof inner.access_token === "string" && inner.access_token) ||
    (typeof d.token === "string" && d.token) ||
    (inner && typeof inner.token === "string" && inner.token) ||
    (typeof d.accessToken === "string" && d.accessToken) ||
    (inner && typeof inner.accessToken === "string" && inner.accessToken) ||
    null;

  return token && token.length > 0 ? token : null;
}

/** Persist JWT for client-side API calls. Throws if no token or storage fails. */
export function persistAuthSession(data: unknown) {
  const token = extractAccessToken(data);
  if (!token) {
    console.error("Login response:", data);
    throw new Error("No token returned from backend");
  }

  try {
    localStorage.removeItem("access_token");
    localStorage.setItem("access_token", token);
    console.log("Saved token:", token);
  } catch {
    throw new Error("Could not save session. Storage may be disabled.");
  }
}
