import type { ImageProject, ImagesProjectResponse, SceneImage } from "@/features/images/types";
import {
  extractSceneImageUrl,
  extractSummaryThumbnail,
} from "../lib/scene-assets";
import {
  isCompletedStatus,
  normalizeAssetUrl,
  projectsFromListPayload,
  readBooleanFavorite,
  readId,
  readNumber,
  readProgress,
  readString,
  readTotalCost,
  unwrapPayload,
} from "../lib/payload";
import type { StudioProjectDetail, StudioProjectSummary, StudioScene } from "../types";

function readSceneNumber(row: Record<string, unknown>): number | null {
  const raw = row.sceneNumber ?? row.scene_number ?? row.sequence;
  return readNumber(raw);
}

export function legacyRowToStudioScene(row: Record<string, unknown>): StudioScene | null {
  const sequence = readSceneNumber(row);
  if (sequence == null) return null;

  const id =
    readString(row.id) ??
    readString(row._id) ??
    readString(row.sceneId) ??
    null;

  return {
    id,
    sequence,
    imageUrl: extractSceneImageUrl(row),
    status: readString(row.status) ?? undefined,
    approvalStatus: readString(row.approvalStatus ?? row.approval_status) ?? undefined,
    narrationOverride:
      readString(row.narrationOverride ?? row.narration_override) ?? undefined,
    motionPresetId:
      readString(row.motionPresetId ?? row.motion_preset_id) ?? undefined,
    motionPresetKey:
      readString(row.motionPresetKey ?? row.motion_preset_key) ?? undefined,
    renderReadiness:
      readString(row.renderReadiness ?? row.render_readiness) ?? undefined,
    prompt: readString(row.prompt) ?? undefined,
    durationSeconds: readNumber(row.durationSeconds ?? row.duration_seconds),
    transitionStyle: readString(row.transitionStyle ?? row.transition_style) ?? undefined,
    narrationLine:
      readString(
        row.narrationLine ??
          row.narration_line ??
          row.narrationOverride ??
          row.narration_override
      ) ?? undefined,
  };
}

export function scenesFromLegacyPayload(data: unknown): StudioScene[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const list = d.images ?? d.scenes;
  if (!Array.isArray(list)) return [];
  const out: StudioScene[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const scene = legacyRowToStudioScene(item as Record<string, unknown>);
    if (scene) out.push(scene);
  }
  return out;
}

export function mergeStudioScenes(
  prev: StudioScene[],
  incoming: StudioScene[]
): StudioScene[] {
  const map = new Map<number, StudioScene>();
  for (const s of prev) map.set(s.sequence, { ...s });
  for (const s of incoming) {
    const cur = map.get(s.sequence);
    const nextUrl =
      s.imageUrl != null && s.imageUrl !== ""
        ? s.imageUrl
        : cur?.imageUrl ?? null;
    map.set(s.sequence, {
      ...cur,
      ...s,
      id: s.id ?? cur?.id ?? null,
      sequence: s.sequence,
      imageUrl: nextUrl,
      status: s.status ?? cur?.status,
    });
  }
  return Array.from(map.values());
}

/** Parse legacy `GET /api/images/:id` (or generate response) into canonical detail. */
export function parseLegacyProjectDetail(raw: unknown): StudioProjectDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;

  let project: Record<string, unknown> | null = null;
  if (
    root.data !== undefined &&
    typeof root.data === "object" &&
    root.data !== null
  ) {
    const d = root.data as Record<string, unknown>;
    if (Array.isArray(d.images) || Array.isArray(d.scenes)) {
      project = d;
    } else if (
      d.data !== undefined &&
      typeof d.data === "object" &&
      d.data !== null
    ) {
      const inner = d.data as Record<string, unknown>;
      if (Array.isArray(inner.images) || Array.isArray(inner.scenes)) {
        project = inner;
      }
    }
  }
  if (!project && (Array.isArray(root.images) || Array.isArray(root.scenes))) {
    project = root;
  }

  const id =
    readId(project ?? root) ??
    readId(root) ??
    null;
  if (!id) return null;

  const scenes = project
    ? scenesFromLegacyPayload({
        images: project.images,
        scenes: project.scenes,
      })
    : scenesFromLegacyPayload(raw);

  let progress: number | null = null;
  if (project) {
    const totalScenes = project.totalScenes ?? project.total_scenes;
    const completedScenes = project.completedScenes ?? project.completed_scenes;
    if (
      typeof totalScenes === "number" &&
      totalScenes > 0 &&
      typeof completedScenes === "number" &&
      !Number.isNaN(completedScenes)
    ) {
      progress = Math.round((completedScenes / totalScenes) * 100);
    }
  }
  const pFallback =
    readProgress(raw) ?? (project ? readProgress(project) : null);
  if (progress == null && pFallback != null) progress = pFallback;

  const totalCost =
    readTotalCost(raw) ?? (project ? readTotalCost(project) : null);

  const videoSource =
    project ??
    (root.data && typeof root.data === "object" && root.data !== null
      ? (root.data as Record<string, unknown>)
      : null);

  let videoUrl: string | null = null;
  let videoStatus: string | null = null;
  let videoError: string | null = null;
  if (videoSource) {
    const u = videoSource.videoUrl ?? videoSource.video_url;
    videoUrl = normalizeAssetUrl(u) ?? (typeof u === "string" ? u : null);
    const vs = videoSource.videoStatus ?? videoSource.video_status;
    videoStatus = typeof vs === "string" ? vs : null;
    const ve = videoSource.videoError ?? videoSource.video_error;
    videoError = typeof ve === "string" ? ve : null;
  }

  const storyboardId = readString(
    project?.storyboardId ??
      project?.storyboard_id ??
      root.storyboardId ??
      root.storyboard_id
  );

  return {
    id,
    storyboardId,
    scenes,
    progress,
    totalCost,
    render: { videoUrl, videoStatus, videoError },
  };
}

export function parseLegacyProjectList(raw: unknown): StudioProjectSummary[] {
  const rows = projectsFromListPayload(raw);

  return rows
    .map((row): StudioProjectSummary | null => {
      if (!row || typeof row !== "object") return null;
      const p = row as Record<string, unknown>;
      const id = readId(p);
      if (!id) return null;
      const total = p.totalScenes ?? p.total_scenes;
      const completed = p.completedScenes ?? p.completed_scenes;
      let progress = readProgress(p);
      if (
        progress == null &&
        typeof total === "number" &&
        total > 0 &&
        typeof completed === "number"
      ) {
        progress = Math.round((completed / total) * 100);
      }
      return {
        id,
        legacyImageProjectId: id,
        prompt: readString(p.prompt) ?? "",
        thumbnail: extractSummaryThumbnail(p),
        progress,
        isFavorite: readBooleanFavorite(
          p.isFavorite ?? p.is_favorite ?? p.favorite
        ),
        createdAt: readString(p.createdAt ?? p.created_at),
        totalScenes: typeof total === "number" ? total : undefined,
        completedScenes: typeof completed === "number" ? completed : undefined,
      };
    })
    .filter((p): p is StudioProjectSummary => p != null);
}

/** Map canonical scene → legacy grid row (keeps current UI working). */
export function studioSceneToLegacyImage(scene: StudioScene): SceneImage {
  return {
    scene_number: scene.sequence,
    imageUrl: scene.imageUrl,
    status: scene.status,
  };
}

export function studioDetailToLegacyResponse(
  detail: StudioProjectDetail
): ImagesProjectResponse {
  return {
    scenes: detail.scenes.map(studioSceneToLegacyImage),
    progress: detail.progress,
    totalCost: detail.totalCost,
    videoUrl: detail.render.videoUrl,
    videoStatus: detail.render.videoStatus,
    videoError: detail.render.videoError,
  };
}

/** Bridge: legacy HTTP body → legacy `ImagesProjectResponse` for existing hook. */
export function parseLegacyImagesProjectResponse(
  raw: unknown
): ImagesProjectResponse | null {
  const detail = parseLegacyProjectDetail(raw);
  if (!detail) return null;
  return studioDetailToLegacyResponse(detail);
}

export function studioSummaryToLegacyImageProject(
  summary: StudioProjectSummary
): ImageProject {
  const imageProjectId = summary.legacyImageProjectId;
  const linked = Boolean(imageProjectId);
  return {
    id: imageProjectId ?? summary.id,
    projectId: imageProjectId ?? undefined,
    studioProjectId: summary.id,
    legacyImageProjectId: imageProjectId ?? undefined,
    imagePipelineLinked: linked,
    templateKey: summary.templateKey ?? undefined,
    videoStatus: summary.videoStatus ?? undefined,
    prompt: summary.prompt,
    thumbnail: summary.thumbnail,
    progress: summary.progress ?? undefined,
    totalScenes: summary.totalScenes,
    completedScenes: summary.completedScenes,
    createdAt: summary.createdAt ?? undefined,
    isFavorite: summary.isFavorite,
  };
}

export function legacySocketPayloadToScenePatch(
  payload: Record<string, unknown>
): Partial<StudioScene> | null {
  const sequence = readSceneNumber(payload);
  if (sequence == null) return null;
  const rawUrl = normalizeAssetUrl(payload.imageUrl ?? payload.image_url);
  const status = readString(payload.status) ?? undefined;
  return {
    id: readString(payload.sceneId ?? payload.id),
    sequence,
    imageUrl: rawUrl,
    status,
  };
}

export { isCompletedStatus, unwrapPayload as getProjectPayload };
