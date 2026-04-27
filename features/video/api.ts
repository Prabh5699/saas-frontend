import { apiFetch } from "@/lib/api";

export async function generateVideo({
  prompt,
  duration,
  headers,
}: {
  prompt: string;
  duration: number;
  headers: Record<string, string>;
}) {
  return apiFetch("/api/video/generate", {
    method: "POST",
    headers: {
      ...headers,
    },
    body: JSON.stringify({ prompt, duration }),
  });
}

export async function getVideoJob({
  jobId,
  headers,
}: {
  jobId: string;
  headers: Record<string, string>;
}) {
  return apiFetch(`/api/video/${jobId}`, {
    headers: { ...headers },
  });
}
