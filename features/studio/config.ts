/**
 * API mode for incremental migration.
 * - `legacy` — poll/render on `/api/images/*`; library still uses `GET /api/projects`
 * - `projects` — same as legacy for reads (recommended)
 * - `dual` — kept for compatibility; no longer calls removed `/api/images` list/search
 */
export type StudioApiMode = "legacy" | "projects" | "dual";

export function getStudioApiMode(): StudioApiMode {
  const raw = process.env.NEXT_PUBLIC_STUDIO_API_MODE?.trim().toLowerCase();
  if (raw === "legacy" || raw === "projects" || raw === "dual") return raw;
  return "projects";
}

export function useProjectsReads(): boolean {
  return true;
}

export function preferProjectsOnly(): boolean {
  return getStudioApiMode() === "projects";
}

/** Socket.IO namespace for image generation progress. */
export const STUDIO_SOCKET_NAMESPACE = "/images";
