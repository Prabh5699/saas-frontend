import { API_BASE } from "@/lib/api";
import type {
  ImageProject,
  ImagesProjectResponse,
  SceneImage,
} from "./types";

export const LAST_IMAGE_PROJECT_KEY = "last_image_project_id";

/** Nest `{ success: true, data: { ... } }` → inner project object; else root. */
export function getProjectPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  if (
    root.success === true &&
    root.data !== undefined &&
    typeof root.data === "object" &&
    root.data !== null
  ) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

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

function readSceneNumber(row: Record<string, unknown>): number | null {
  const raw = row.sceneNumber ?? row.scene_number;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
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
    const scene_number = readSceneNumber(row);
    if (scene_number == null) continue;
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
  const map = new Map<number, SceneImage>();
  for (const img of prev) map.set(img.scene_number, { ...img });
  for (const img of incoming) {
    const cur = map.get(img.scene_number);
    const nextUrl =
      img.imageUrl != null && img.imageUrl !== ""
        ? img.imageUrl
        : cur?.imageUrl ?? null;
    map.set(img.scene_number, {
      scene_number: img.scene_number,
      imageUrl: nextUrl,
      status: img.status ?? cur?.status,
    });
  }
  return Array.from(map.values());
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

export function parseImagesProjectResponse(
  raw: unknown
): ImagesProjectResponse | null {
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

  const scenes = project
    ? scenesFromPayload({
        images: project.images,
        scenes: project.scenes,
      })
    : scenesFromPayload(raw);

  let progress: number | null = null;
  if (project) {
    const totalScenes = project.totalScenes;
    const completedScenes = project.completedScenes;
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
    videoUrl = normalizeImageUrl(u) ?? (typeof u === "string" ? u : null);
    const vs = videoSource.videoStatus ?? videoSource.video_status;
    videoStatus = typeof vs === "string" ? vs : null;
    const ve = videoSource.videoError ?? videoSource.video_error;
    videoError = typeof ve === "string" ? ve : null;
  }

  return { scenes, progress, totalCost, videoUrl, videoStatus, videoError };
}

export function isCompletedStatus(status: string | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "completed" || s === "complete" || s === "done";
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
