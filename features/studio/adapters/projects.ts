import { extractSummaryThumbnail } from "../lib/scene-assets";
import {
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
import type {
  StudioMotionPreset,
  StudioProjectDetail,
  StudioProjectSummary,
  StudioScene,
  StudioStoryboardCompilePreview,
  StudioTemplate,
  StudioVoiceProfile,
} from "../types";
import { legacyRowToStudioScene, scenesFromLegacyPayload } from "./legacy-images";

function sceneRowsFromProject(project: Record<string, unknown>): StudioScene[] {
  if (Array.isArray(project.scenes)) {
    const out: StudioScene[] = [];
    for (const row of project.scenes) {
      if (!row || typeof row !== "object") continue;
      const scene = legacyRowToStudioScene(row as Record<string, unknown>);
      if (scene) out.push(scene);
    }
    return out;
  }
  return scenesFromLegacyPayload(project);
}

/** Parse `GET /api/projects/:id` into canonical detail. */
export function parseProjectsApiDetail(raw: unknown): StudioProjectDetail | null {
  const root = unwrapPayload(raw);
  if (!root) return null;

  const id = readId(root);
  if (!id) return null;

  const scenes = sceneRowsFromProject(root);
  let progress = readProgress(root);
  const total = root.totalScenes ?? root.total_scenes ?? root.sceneCount;
  const completed = root.completedScenes ?? root.completed_scenes;
  if (
    progress == null &&
    typeof total === "number" &&
    total > 0 &&
    typeof completed === "number"
  ) {
    progress = Math.round((completed / total) * 100);
  }

  const renderRoot =
    root.render && typeof root.render === "object"
      ? (root.render as Record<string, unknown>)
      : root;

  const videoUrl = normalizeAssetUrl(
    renderRoot.videoUrl ?? renderRoot.video_url ?? root.videoUrl ?? root.video_url
  );
  const videoStatus = readString(
    renderRoot.videoStatus ?? renderRoot.video_status ?? root.videoStatus
  );
  const videoError = readString(
    renderRoot.videoError ?? renderRoot.video_error ?? root.videoError
  );

  return {
    id,
    storyboardId: readString(root.storyboardId ?? root.storyboard_id),
    scenes,
    progress,
    totalCost: readTotalCost(root),
    render: { videoUrl, videoStatus, videoError },
  };
}

export function parseProjectsApiList(raw: unknown): StudioProjectSummary[] {
  const rows = projectsFromListPayload(raw);
  return rows
    .map((row): StudioProjectSummary | null => {
      if (!row || typeof row !== "object") return null;
      const p = row as Record<string, unknown>;
      const id = readId(p);
      if (!id) return null;
      const total = p.totalScenes ?? p.total_scenes ?? p.sceneCount;
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
      const legacyImageProjectId =
        readString(
          p.legacyImageProjectId ??
            p.legacy_image_project_id ??
            p.imageProjectId ??
            p.image_project_id
        ) ?? null;

      return {
        id,
        legacyImageProjectId,
        templateKey: readString(
          p.templateKey ?? p.template_key ?? p.template
        ),
        videoStatus: readString(p.videoStatus ?? p.video_status),
        prompt: readString(p.prompt ?? p.title) ?? "",
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

function catalogRows(raw: unknown): unknown[] {
  const inner = unwrapPayload(raw);
  if (Array.isArray(inner)) return inner;
  if (!inner) return [];
  if (Array.isArray(inner.data)) return inner.data;
  if (Array.isArray(inner.items)) return inner.items;
  return [];
}

export function parseTemplatesCatalog(raw: unknown): StudioTemplate[] {
  return catalogRows(raw)
    .map((row): StudioTemplate | null => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const id = readId(r);
      const name = readString(r.name);
      const key =
        readString(r.key) ?? readString(r.templateKey) ?? id;
      if (!id || !name || !key) return null;
      return {
        id,
        key,
        name,
        description: readString(r.description),
        category: readString(r.category),
        thumbnailUrl: normalizeAssetUrl(
          r.thumbnailUrl ?? r.thumbnail_url ?? r.thumbnail
        ),
        defaultSceneCount: readNumber(
          r.defaultSceneCount ?? r.default_scene_count ?? r.sceneCount
        ),
        defaultDurationSec: readNumber(
          r.defaultDurationSec ??
            r.default_duration_sec ??
            r.defaultDurationSeconds
        ),
        defaultAspectRatio: readString(
          r.defaultAspectRatio ?? r.default_aspect_ratio
        ),
      };
    })
    .filter((t): t is StudioTemplate => t != null);
}

export function parseMotionPresetsCatalog(raw: unknown): StudioMotionPreset[] {
  return catalogRows(raw)
    .map((row): StudioMotionPreset | null => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const id = readId(r);
      const name = readString(r.name);
      const key =
        readString(r.key) ?? readString(r.motionPresetKey) ?? id;
      if (!id || !name || !key) return null;
      return {
        id,
        key,
        name,
        description: readString(r.description),
        category: readString(r.category),
      };
    })
    .filter((m): m is StudioMotionPreset => m != null);
}

export function parseVoiceProfilesCatalog(raw: unknown): StudioVoiceProfile[] {
  return catalogRows(raw)
    .map((row): StudioVoiceProfile | null => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const id = readId(r) ?? readString(r.voiceId ?? r.voice_id);
      const name = readString(r.name);
      if (!id || !name) return null;
      return {
        id,
        name,
        provider: readString(r.provider),
        previewUrl: normalizeAssetUrl(r.previewUrl ?? r.preview_url),
      };
    })
    .filter((v): v is StudioVoiceProfile => v != null);
}

/** Parse `GET /api/projects/:id/scenes` list payloads. */
export function parseProjectScenesList(raw: unknown): StudioScene[] {
  const inner = unwrapPayload(raw);
  const list = inner
    ? Array.isArray(inner)
      ? inner
      : Array.isArray(inner.scenes)
        ? inner.scenes
        : Array.isArray(inner.data)
          ? inner.data
          : []
    : Array.isArray(raw)
      ? raw
      : [];
  const out: StudioScene[] = [];
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const scene = legacyRowToStudioScene(row as Record<string, unknown>);
    if (scene) out.push(scene);
  }
  return out;
}

export function parseStoryboardCompilePreview(
  raw: unknown
): StudioStoryboardCompilePreview | null {
  const root = unwrapPayload(raw);
  if (!root) return null;

  const storyboard =
    root.storyboard && typeof root.storyboard === "object"
      ? (root.storyboard as Record<string, unknown>)
      : null;
  const scenesRaw = root.scenes ?? storyboard?.scenes;
  const scenes: StudioStoryboardCompilePreview["scenes"] = [];
  if (Array.isArray(scenesRaw)) {
    for (const row of scenesRaw) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const sequence = readNumber(r.sequence ?? r.sceneNumber ?? r.scene_number);
      if (sequence == null) continue;
      scenes.push({
        sequence,
        prompt: readString(r.prompt),
        durationSeconds: readNumber(r.durationSeconds ?? r.duration_seconds),
      });
    }
  }

  return {
    storyboardId: readString(root.storyboardId ?? root.storyboard_id),
    scenes,
    estimatedDurationSeconds: readNumber(
      root.estimatedDurationSeconds ?? root.estimated_duration_seconds
    ),
    pacingSummary: readString(root.pacingSummary ?? root.pacing_summary),
  };
}
