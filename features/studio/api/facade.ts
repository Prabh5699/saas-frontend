import { getStudioApiMode, preferProjectsOnly, useProjectsReads } from "../config";
import {
  parseLegacyImagesProjectResponse,
  parseLegacyProjectDetail,
  parseLegacyProjectList,
  studioDetailToLegacyResponse,
  studioSummaryToLegacyImageProject,
} from "../adapters/legacy-images";
import {
  parseProjectScenesList,
  parseProjectsApiDetail,
  parseProjectsApiList,
} from "../adapters/projects";
import {
  shouldFallbackToLegacyDetail,
  shouldFallbackToLegacyList,
} from "../lib/read-fallback";
import type { ImageProject, ImagesProjectResponse } from "@/features/images/types";
import type { StudioProjectDetail } from "../types";
import {
  deleteLegacyImageProject,
  generateLegacyImages,
  getLegacyImageProject,
  listLegacyImageProjects,
  renderLegacySlideshowVideo,
  searchLegacyImageProjects,
  setLegacyImageProjectFavorite,
  type RenderSlideshowBody,
} from "./legacy-images";
import { prepareScenesForSlideshowRender } from "./prepare-render";
import {
  deleteProject,
  getProject,
  listProjectScenes,
  listProjects,
  renderProjectSlideshow,
  searchProjects,
  setProjectFavorite,
} from "./projects";
import type { StudioScene } from "../types";

function imageProjectsFromSummaries(
  summaries: ReturnType<typeof parseLegacyProjectList>
): ImageProject[] {
  return summaries.map(studioSummaryToLegacyImageProject);
}

async function enrichProjectScenes(
  projectId: string,
  headers: Record<string, string>,
  studio: StudioProjectDetail
): Promise<StudioProjectDetail> {
  if (studio.scenes.length > 0) return studio;
  const { res, data } = await listProjectScenes({ projectId, headers });
  if (!res.ok) return studio;
  const scenes = parseProjectScenesList(data);
  if (scenes.length === 0) return studio;
  return { ...studio, scenes };
}

/**
 * Fetch project detail — projects API when mode allows, else legacy images.
 * In `dual` mode, falls back to legacy when projects payload has no image URLs.
 */
export async function fetchStudioProjectDetailLegacyView({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}): Promise<{
  res: Response;
  data: unknown;
  legacy: ImagesProjectResponse | null;
  studio: StudioProjectDetail | null;
}> {
  /**
   * Dual-read for project *detail* caused 404 (projects) + 200 (images) on every poll.
   * Use legacy detail until projects payloads include image URLs reliably.
   */
  const useProjectsDetail =
    useProjectsReads() && getStudioApiMode() === "projects";

  if (useProjectsDetail) {
    const { res, data } = await getProject({ id, headers });
    let studio = res.ok ? parseProjectsApiDetail(data) : null;
    if (studio) {
      studio = await enrichProjectScenes(id, headers, studio);
      if (!shouldFallbackToLegacyDetail(studio)) {
        return {
          res,
          data,
          studio,
          legacy: studioDetailToLegacyResponse(studio),
        };
      }
    }
    if (preferProjectsOnly()) {
      return { res, data, studio: null, legacy: null };
    }
  }

  const { res, data } = await getLegacyImageProject({ id, headers });
  const studio =
    parseProjectsApiDetail(data) ?? parseLegacyProjectDetail(data);
  const legacy =
    studio != null
      ? studioDetailToLegacyResponse(studio)
      : parseLegacyImagesProjectResponse(data);
  return { res, data, legacy, studio };
}

export async function fetchStudioProjectListLegacyView(
  token: string
): Promise<ImageProject[]> {
  if (useProjectsReads()) {
    const { res, data } = await listProjects(token);
    if (res.ok && data != null) {
      const parsed = parseProjectsApiList(data);
      if (parsed.length > 0 && !shouldFallbackToLegacyList(parsed)) {
        return imageProjectsFromSummaries(parsed);
      }
    }
    if (preferProjectsOnly()) return [];
  }

  const { res, data } = await listLegacyImageProjects(token);
  if (!res.ok || data == null) return [];
  return imageProjectsFromSummaries(parseLegacyProjectList(data));
}

export async function searchStudioProjectsLegacyView({
  query,
  token,
}: {
  query: string;
  token: string;
}): Promise<ImageProject[]> {
  if (useProjectsReads()) {
    const { res, data } = await searchProjects({ query, token });
    if (res.ok && data != null) {
      const parsed = parseProjectsApiList(data);
      if (parsed.length > 0 && !shouldFallbackToLegacyList(parsed)) {
        return imageProjectsFromSummaries(parsed);
      }
    }
    if (preferProjectsOnly()) return [];
  }

  const { res, data } = await searchLegacyImageProjects({ query, token });
  if (!res.ok || data == null) return [];
  return imageProjectsFromSummaries(parseLegacyProjectList(data));
}

/** Writes stay on legacy `/api/images/*` during FE-2. */
export async function generateStudioImages({
  prompt,
  sceneCount,
  headers,
}: {
  prompt: string;
  sceneCount: number;
  headers: Record<string, string>;
}) {
  return generateLegacyImages({ prompt, sceneCount, headers });
}

function isRenderReadinessError(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const msg = String(
    (data as { message?: unknown }).message ?? ""
  ).toLowerCase();
  return (
    msg.includes("renderreadiness") ||
    msg.includes("eligible for render") ||
    msg.includes("no scenes eligible")
  );
}

export async function renderStudioSlideshow({
  projectId,
  body,
  headers,
  scenes = [],
}: {
  projectId: string;
  body?: RenderSlideshowBody;
  headers: Record<string, string>;
  scenes?: StudioScene[];
}) {
  if (scenes.length > 0) {
    await prepareScenesForSlideshowRender({ projectId, scenes, headers });
  }

  const renderBody: RenderSlideshowBody = {
    ...body,
    skipRenderReadinessCheck: true,
    skipRenderReadiness: true,
  };

  const legacyResult = await renderLegacySlideshowVideo({
    projectId,
    body: renderBody,
    headers,
  });

  if (legacyResult.res.ok || !isRenderReadinessError(legacyResult.data)) {
    return legacyResult;
  }

  const projectsResult = await renderProjectSlideshow({
    projectId,
    body: renderBody as Record<string, unknown>,
    headers,
  });

  if (projectsResult.res.ok) return projectsResult;
  return legacyResult;
}

export async function setStudioProjectFavorite({
  id,
  isFavorite,
  headers,
}: {
  id: string;
  isFavorite: boolean;
  headers: Record<string, string>;
}) {
  if (useProjectsReads()) {
    const result = await setProjectFavorite({ id, isFavorite, headers });
    if (result.res.ok || preferProjectsOnly()) return result;
  }
  return setLegacyImageProjectFavorite({ id, isFavorite, headers });
}

export async function deleteStudioProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  if (useProjectsReads()) {
    const result = await deleteProject({ id, headers });
    if (result.res.ok || preferProjectsOnly()) return result;
  }
  return deleteLegacyImageProject({ id, headers });
}
