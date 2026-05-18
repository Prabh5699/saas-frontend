import type { ImagesProjectResponse } from "@/features/images/types";
import type { StudioProjectDetail } from "../types";
import { studioDetailToLegacyResponse } from "../adapters/legacy-images";
import type { StudioScene } from "../types";

export type ProjectDetailPatch = {
  scenes?: StudioScene[];
  progress?: number;
  totalCost?: number | null;
  videoUrl?: string | null;
  videoStatus?: string | null;
  videoError?: string | null;
  storyboardId?: string | null;
};

export function patchFromStudioDetail(
  detail: StudioProjectDetail
): ProjectDetailPatch {
  let progress = detail.progress;
  if (
    detail.scenes.length > 0 &&
    detail.scenes.every((s) => Boolean(s.imageUrl))
  ) {
    progress = 100;
  }
  return {
    scenes: detail.scenes,
    progress: progress ?? undefined,
    totalCost: detail.totalCost,
    videoUrl: detail.render.videoUrl,
    videoStatus: detail.render.videoStatus,
    videoError: detail.render.videoError,
    storyboardId: detail.storyboardId,
  };
}

export function patchFromLegacyResponse(
  parsed: ImagesProjectResponse
): ProjectDetailPatch {
  let progress = parsed.progress;
  if (
    parsed.scenes.length > 0 &&
    parsed.scenes.every((s) => Boolean(s.imageUrl))
  ) {
    progress = 100;
  }
  return {
    scenes: parsed.scenes.map((s) => ({
      id: null,
      sequence: s.scene_number,
      imageUrl: s.imageUrl ?? null,
      status: s.status,
    })),
    progress: progress ?? undefined,
    totalCost: parsed.totalCost,
    videoUrl: parsed.videoUrl,
    videoStatus: parsed.videoStatus,
    videoError: parsed.videoError,
  };
}

export function studioDetailFromLegacy(
  parsed: ImagesProjectResponse,
  projectId: string
): StudioProjectDetail {
  return {
    id: projectId,
    storyboardId: null,
    scenes: parsed.scenes.map((s) => ({
      id: null,
      sequence: s.scene_number,
      imageUrl: s.imageUrl ?? null,
      status: s.status,
    })),
    progress: parsed.progress,
    totalCost: parsed.totalCost,
    render: {
      videoUrl: parsed.videoUrl,
      videoStatus: parsed.videoStatus,
      videoError: parsed.videoError,
    },
  };
}

export { studioDetailToLegacyResponse };
