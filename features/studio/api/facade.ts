import {
  parseLegacyImagesProjectResponse,
  parseLegacyProjectDetail,
  studioDetailToLegacyResponse,
  studioSummaryToLegacyImageProject,
} from "../adapters/legacy-images";
import { parseProjectsApiList } from "../adapters/projects";
import type { ImageProject, ImagesProjectResponse } from "@/features/images/types";
import type { StudioScene } from "../types";
import {
  deleteLegacyImageProject,
  generateLegacyImages,
  getLegacyImageProject,
  renderLegacySlideshowVideo,
  setLegacyImageProjectFavorite,
  type RenderSlideshowBody,
} from "./legacy-images";
import { enrichHistoryThumbnails } from "../lib/enrich-history-thumbnails";
import { prepareScenesForSlideshowRender } from "./prepare-render";
import { listProjects } from "./projects";

/** Library sidebar — `GET /api/projects` (+ image detail for missing thumbs). */
export async function fetchStudioProjectListLegacyView(
  token: string,
  headers?: Record<string, string>
): Promise<ImageProject[]> {
  const { res, data } = await listProjects(token);
  if (!res.ok || data == null) return [];
  const projects = parseProjectsApiList(data).map(
    studioSummaryToLegacyImageProject
  );
  if (!headers?.Authorization) {
    return projects;
  }
  return enrichHistoryThumbnails({ projects, headers });
}

/** Client-side filter (backend has no `GET /api/projects/search`). */
export function filterStudioProjectsByQuery(
  projects: ImageProject[],
  query: string
): ImageProject[] {
  const q = query.trim().toLowerCase();
  if (!q) return projects;
  return projects.filter((p) => {
    const prompt = typeof p.prompt === "string" ? p.prompt.toLowerCase() : "";
    return prompt.includes(q);
  });
}

/**
 * Poll generation + video status — always `GET /api/images/:imageProjectId`.
 * `id` must be the legacy image project id from generate, not `projects.id`.
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
  studio: null;
}> {
  const { res, data } = await getLegacyImageProject({ id, headers });
  const detail = parseLegacyProjectDetail(data);
  const legacy =
    detail != null
      ? studioDetailToLegacyResponse(detail)
      : parseLegacyImagesProjectResponse(data);
  return { res, data, legacy, studio: null };
}

export async function generateStudioImages({
  prompt,
  sceneCount,
  templateKey,
  voiceProfileKey,
  headers,
}: {
  prompt: string;
  sceneCount: number;
  templateKey?: string;
  voiceProfileKey?: string;
  headers: Record<string, string>;
}) {
  return generateLegacyImages({
    prompt,
    sceneCount,
    templateKey,
    voiceProfileKey,
    headers,
  });
}

export async function renderStudioSlideshow({
  imageProjectId,
  studioProjectId,
  body,
  headers,
  scenes = [],
  patchScenesBeforeRender = false,
}: {
  /** Legacy `image_projects` id — required for `POST .../render-video`. */
  imageProjectId: string;
  /** `projects.id` — only used when PATCHing scene readiness before render. */
  studioProjectId?: string | null;
  body?: RenderSlideshowBody;
  headers: Record<string, string>;
  scenes?: StudioScene[];
  patchScenesBeforeRender?: boolean;
}) {
  const renderBody: RenderSlideshowBody = {
    ...body,
    skipRenderReadinessCheck: body?.skipRenderReadinessCheck ?? true,
  };

  if (
    patchScenesBeforeRender &&
    studioProjectId &&
    scenes.length > 0 &&
    !renderBody.skipRenderReadinessCheck
  ) {
    await prepareScenesForSlideshowRender({
      studioProjectId,
      scenes,
      headers,
    });
  }

  return renderLegacySlideshowVideo({
    projectId: imageProjectId,
    body: renderBody,
    headers,
  });
}

export async function setStudioProjectFavorite({
  imageProjectId,
  isFavorite,
  headers,
}: {
  imageProjectId: string;
  isFavorite: boolean;
  headers: Record<string, string>;
}) {
  return setLegacyImageProjectFavorite({
    id: imageProjectId,
    isFavorite,
    headers,
  });
}

export async function deleteStudioProject({
  imageProjectId,
  headers,
}: {
  imageProjectId: string;
  headers: Record<string, string>;
}) {
  return deleteLegacyImageProject({ id: imageProjectId, headers });
}

/** @deprecated Use `filterStudioProjectsByQuery` — no server search endpoint. */
export async function searchStudioProjectsLegacyView({
  query,
  token,
}: {
  query: string;
  token: string;
}): Promise<ImageProject[]> {
  const all = await fetchStudioProjectListLegacyView(token);
  return filterStudioProjectsByQuery(all, query);
}
