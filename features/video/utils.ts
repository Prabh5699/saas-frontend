import { API_BASE } from "@/lib/api";

export function extractVideoUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const keys = ["videoUrl", "url", "src", "playbackUrl", "resultUrl", "fileUrl"];
  for (const k of keys) {
    const v = d[k];
    if (typeof v === "string" && (v.startsWith("http") || v.startsWith("/"))) {
      return v.startsWith("/") ? `${API_BASE}${v}` : v;
    }
  }
  if (d.data && typeof d.data === "object") {
    return extractVideoUrl(d.data);
  }
  return null;
}

export function extractJobId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.id ?? d._id ?? d.videoId ?? d.jobId;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (d.data && typeof d.data === "object") return extractJobId(d.data);
  return null;
}
