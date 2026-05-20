import { API_BASE } from "@/lib/api";
import {
  getProjectPayload,
  isCompletedStatus,
  mergeStudioScenes,
  parseLegacyImagesProjectResponse,
  studioSceneToLegacyImage,
} from "@/features/studio/adapters/legacy-images";
import { LAST_PROJECT_STORAGE_KEY } from "@/features/studio/constants";
import type { StudioTemplate } from "@/features/studio/types";
import type {
  ImageProject,
  ImagesProjectResponse,
  SceneImage,
  StudioScene,
} from "./types";

export const LAST_IMAGE_PROJECT_KEY = LAST_PROJECT_STORAGE_KEY;

export { getProjectPayload, isCompletedStatus };

export function extractProjectId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.projectId ?? d.id ?? d._id;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (d.data && typeof d.data === "object") return extractProjectId(d.data);
  return null;
}

export function normalizeImageUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return raw;
}

export function scenesFromPayload(data: unknown): SceneImage[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const list = d.images ?? d.scenes;
  if (!Array.isArray(list)) return [];
  const out: SceneImage[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const scene_number =
      typeof row.sceneNumber === "number"
        ? row.sceneNumber
        : typeof row.scene_number === "number"
          ? row.scene_number
          : Number(row.scene_number ?? row.sceneNumber);
    if (!Number.isFinite(scene_number)) continue;
    const imageUrl =
      normalizeImageUrl(row.imageUrl ?? row.image_url ?? row.url) ?? null;
    const status = typeof row.status === "string" ? row.status : undefined;
    out.push({ scene_number, imageUrl, status });
  }
  return out;
}

export function mergeScenes(
  prev: SceneImage[],
  incoming: SceneImage[]
): SceneImage[] {
  const prevStudio: StudioScene[] = prev.map((s) => ({
    id: null,
    sequence: s.scene_number,
    imageUrl: s.imageUrl ?? null,
    status: s.status,
  }));
  const incomingStudio: StudioScene[] = incoming.map((s) => ({
    id: null,
    sequence: s.scene_number,
    imageUrl: s.imageUrl ?? null,
    status: s.status,
  }));
  return mergeStudioScenes(prevStudio, incomingStudio).map(
    studioSceneToLegacyImage
  );
}

export function readProgress(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const p = (data as Record<string, unknown>).progress;
  if (typeof p !== "number" || Number.isNaN(p)) return null;
  return Math.min(100, Math.max(0, p));
}

export function sceneIsActivelyGenerating(scene: {
  imageUrl?: string | null;
  status?: string;
}): boolean {
  if (scene.imageUrl) return false;
  return (scene.status ?? "").toLowerCase() === "processing";
}

export function sceneIsWaitingForImage(scene: {
  imageUrl?: string | null;
  status?: string;
}): boolean {
  if (scene.imageUrl) return false;
  const s = (scene.status ?? "").toLowerCase();
  if (s === "failed" || s === "cancelled") return false;
  return s === "pending" || s === "processing" || s === "";
}

export function getMissingImageSceneNumbers(
  sortedImages: SceneImage[],
  sceneCount: number
): number[] {
  const expected = Math.max(
    sceneCount,
    sortedImages.length > 0
      ? Math.max(...sortedImages.map((i) => i.scene_number))
      : 0
  );
  if (expected <= 0) return [];

  const missing: number[] = [];
  for (let n = 1; n <= expected; n++) {
    const row = sortedImages.find((i) => i.scene_number === n);
    if (!row?.imageUrl) missing.push(n);
  }
  return missing;
}

/** True when image generation is done — even if API progress is stale. */
export function isImagesGenerationComplete(args: {
  projectId: string | null;
  projectFailed: boolean;
  progress: number;
  videoUrl: string | null;
  scenes: StudioScene[];
  sortedImages: SceneImage[];
  sceneCount: number;
}): boolean {
  const {
    projectId,
    projectFailed,
    progress,
    videoUrl,
    scenes,
    sortedImages,
    sceneCount,
  } = args;

  if (!projectId || projectFailed) return true;
  if (progress >= 100) return true;
  if (videoUrl) return true;

  const withUrl = sortedImages.filter((i) => Boolean(i.imageUrl));
  if (withUrl.length === 0) return false;

  const processing =
    sortedImages.some(sceneIsActivelyGenerating) ||
    scenes.some(sceneIsActivelyGenerating);
  if (!processing) return true;

  if (scenes.length > 0 && scenes.every((s) => Boolean(s.imageUrl))) {
    return true;
  }

  const expected = Math.max(sceneCount, sortedImages.length, scenes.length);
  if (expected > 0 && withUrl.length >= expected) return true;

  return false;
}

export function getRenderUnavailableReason(args: {
  projectId: string | null;
  projectFailed: boolean;
  hasImages: boolean;
  videoDone: boolean;
  videoRenderInProgress: boolean;
  imagesGenerationComplete: boolean;
  missingSceneNumbers: number[];
}): string | null {
  const {
    projectId,
    projectFailed,
    hasImages,
    videoDone,
    videoRenderInProgress,
    imagesGenerationComplete,
    missingSceneNumbers,
  } = args;

  if (!projectId) return "Open or create a project first.";
  if (projectFailed) return "This project failed. Generate again to continue.";
  if (videoDone) return "Video already rendered. Download it from the preview panel.";
  if (videoRenderInProgress) return "A video render is already in progress.";
  if (!hasImages) return "Generate scene images before rendering a video.";
  if (!imagesGenerationComplete) {
    return "Scenes are still generating. Wait for them to finish, or retry generation.";
  }
  if (missingSceneNumbers.length > 0) {
    return `Scene${missingSceneNumbers.length > 1 ? "s" : ""} ${missingSceneNumbers.join(", ")} ${missingSceneNumbers.length > 1 ? "are" : "is"} missing images. Turn on "Include all scenes" to render with the scenes you have.`;
  }
  return null;
}

export function isVideoRenderInProgress(args: {
  videoUrl: string | null;
  videoStatus: string | null;
  videoRenderLoading: boolean;
}): boolean {
  if (args.videoUrl) return false;
  if (args.videoRenderLoading) return true;
  const s = (args.videoStatus ?? "").toLowerCase();
  return s === "queued" || s === "processing";
}

/** Whether the project detail endpoint should be polled on an interval. */
export function shouldPollProjectDetail(args: {
  projectId: string | null;
  projectFailed: boolean;
  imagesGenerationComplete: boolean;
  videoRenderInProgress: boolean;
}): boolean {
  const {
    projectId,
    projectFailed,
    imagesGenerationComplete,
    videoRenderInProgress,
  } = args;
  if (!projectId || projectFailed) return false;
  if (!imagesGenerationComplete) return true;
  return videoRenderInProgress;
}

export function readTotalCost(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.totalCost ?? d.total_cost ?? d.cost;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Parses legacy or bridged project payloads into the shape the hook expects. */
export function parseImagesProjectResponse(
  raw: unknown
): ImagesProjectResponse | null {
  return parseLegacyImagesProjectResponse(raw);
}

export async function downloadImage(url: string, sceneNumber: number) {
  const filename = `scene-${sceneNumber}.png`;
  const proxyHref = `/api/download?url=${encodeURIComponent(
    url
  )}&filename=${encodeURIComponent(filename)}`;
  try {
    const res = await fetch(proxyHref);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    const link = document.createElement("a");
    link.href = proxyHref;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/** Image project id for poll / render / WebSocket / favorite / delete. */
export function historyImageProjectId(p: ImageProject): string | null {
  if (p.imagePipelineLinked === false) return null;
  const raw = p.legacyImageProjectId ?? p.projectId ?? p._id;
  if (typeof raw === "string" && raw) return raw;
  if (typeof raw === "number") return String(raw);
  return null;
}

export function historyCanOpenImagePipeline(p: ImageProject): boolean {
  return historyImageProjectId(p) != null;
}

/** Studio `projects.id` for PATCH scenes. */
export function historyStudioProjectId(p: ImageProject): string | null {
  const raw = p.studioProjectId;
  if (typeof raw === "string" && raw) return raw;
  return null;
}

/** @deprecated Use `historyImageProjectId` */
export function historyProjectId(p: ImageProject): string | null {
  return historyImageProjectId(p);
}

export function historyProjectIsFavorite(p: ImageProject): boolean {
  const v = p.isFavorite ?? p.is_favorite ?? p.favorite;
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1") return true;
  if (v === "true") return true;
  return false;
}

export function historyCreatedLabel(p: ImageProject): string | null {
  const raw = p.createdAt ?? p.created_at;
  if (typeof raw !== "string") return null;
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function historyCreatedTime(p: ImageProject): number {
  const raw = p.createdAt ?? p.created_at;
  if (typeof raw !== "string") return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function historyFirstThumb(p: ImageProject): string | null {
  const row = p as ImageProject & {
    thumbnailUrl?: string;
    thumbnail_url?: string;
  };
  return normalizeImageUrl(
    p.thumbnail ?? row.thumbnailUrl ?? row.thumbnail_url
  );
}

export function historyPromptLabel(p: ImageProject): string {
  const t = p.prompt;
  return typeof t === "string" ? t : "";
}

export function formatTemplateKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function historyTemplateLabel(
  p: ImageProject,
  templates: StudioTemplate[] = []
): string | null {
  const key = p.templateKey;
  if (!key || typeof key !== "string") return null;
  const match = templates.find((t) => t.key === key);
  return match?.name ?? formatTemplateKey(key);
}

export function historySceneCountLabel(p: ImageProject): string | null {
  const total = p.totalScenes ?? p.total_scenes;
  if (typeof total !== "number" || total <= 0) return null;
  const completed = p.completedScenes ?? p.completed_scenes;
  if (typeof completed === "number") {
    return `${completed}/${total} scenes`;
  }
  return `${total} scenes`;
}

export function historyVideoStatusLabel(p: ImageProject): string | null {
  const raw = p.videoStatus;
  if (!raw || typeof raw !== "string") return null;
  const s = raw.toLowerCase();
  if (s === "completed") return "Video ready";
  if (s === "processing" || s === "queued") return "Rendering video";
  if (s === "failed") return "Video failed";
  return null;
}

export function historyProgressPercent(p: ImageProject): number | null {
  const raw = p.progress;
  if (typeof raw === "number" && !Number.isNaN(raw)) {
    return Math.min(100, Math.max(0, Math.round(raw)));
  }
  const total = p.totalScenes ?? p.total_scenes;
  const completed = p.completedScenes ?? p.completed_scenes;
  if (
    typeof total === "number" &&
    total > 0 &&
    typeof completed === "number" &&
    !Number.isNaN(completed)
  ) {
    return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
  }
  return null;
}

export function historyProgressLabel(p: ImageProject): string {
  const pct = historyProgressPercent(p);
  return pct == null ? "-" : `${pct}%`;
}
