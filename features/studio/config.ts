/**
 * API mode for incremental migration.
 * - `legacy` — `/api/images/*` only (default, current production behavior)
 * - `projects` — prefer `/api/projects/*` reads where implemented
 * - `dual` — try projects read, fall back to legacy on failure
 */
export type StudioApiMode = "legacy" | "projects" | "dual";

export function getStudioApiMode(): StudioApiMode {
  const raw = process.env.NEXT_PUBLIC_STUDIO_API_MODE?.trim().toLowerCase();
  if (raw === "legacy" || raw === "projects" || raw === "dual") return raw;
  /** FE-2: default to dual-read (projects first, legacy fallback). Set `legacy` to roll back reads. */
  return "dual";
}

export function useProjectsReads(): boolean {
  const mode = getStudioApiMode();
  return mode === "projects" || mode === "dual";
}

export function preferProjectsOnly(): boolean {
  return getStudioApiMode() === "projects";
}

/** Socket.IO namespace path segment (backend still serves `/images` during bridge). */
export const STUDIO_SOCKET_NAMESPACE = "/images";
