import { getProjectPayload } from "../adapters/legacy-images";

export function projectStatusFailure(
  data: unknown
): { fail: true; message: string } | { fail: false } {
  const inner = getProjectPayload(data);
  if (!inner) return { fail: false };
  const st = String(inner.status ?? "").toLowerCase();
  if (st === "failed" || st === "error" || st === "cancelled") {
    return {
      fail: true,
      message:
        typeof inner.message === "string"
          ? inner.message
          : "Image generation failed.",
    };
  }
  return { fail: false };
}
