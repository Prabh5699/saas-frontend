import { API_BASE } from "@/lib/api";
import {
  getProjectPayload,
  isCompletedStatus,
  mergeStudioScenes,
  parseLegacyImagesProjectResponse,
  studioSceneToLegacyImage,
} from "@/features/studio/adapters/legacy-images";
import { LAST_PROJECT_STORAGE_KEY } from "@/features/studio/constants";
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

export function historyProjectId(p: ImageProject): string | null {
  const raw = p.projectId ?? p._id ?? p.id;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return null;
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
  return normalizeImageUrl(p.thumbnail);
}

export function historyPromptLabel(p: ImageProject): string {
  const t = p.prompt;
  return typeof t === "string" ? t : "";
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
