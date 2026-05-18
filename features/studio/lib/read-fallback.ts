import { getStudioApiMode } from "../config";
import type { StudioProjectDetail, StudioProjectSummary } from "../types";

/** True when dual mode should retry legacy `/api/images` for richer asset URLs. */
export function shouldFallbackToLegacyDetail(
  studio: StudioProjectDetail | null
): boolean {
  if (getStudioApiMode() !== "dual") return false;
  if (!studio) return true;
  if (studio.scenes.length === 0) return true;
  return !studio.scenes.some((s) => Boolean(s.imageUrl));
}

export function shouldFallbackToLegacyList(
  summaries: StudioProjectSummary[]
): boolean {
  if (getStudioApiMode() !== "dual") return false;
  if (summaries.length === 0) return true;
  return !summaries.some((s) => Boolean(s.thumbnail));
}
