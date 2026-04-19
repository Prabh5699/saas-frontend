"use client";

import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressCard } from "@/components/ui/progress-card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

const API_BASE = "http://localhost:3001";
const LAST_IMAGE_PROJECT_KEY = "last_image_project_id";

type SceneImage = {
  scene_number: number;
  imageUrl?: string | null;
  status?: string;
};

function extractProjectId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.projectId ?? d.id ?? d._id;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (d.data && typeof d.data === "object") return extractProjectId(d.data);
  return null;
}

function normalizeImageUrl(raw: unknown): string | null {
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

function scenesFromPayload(data: unknown): SceneImage[] {
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

function mergeScenes(prev: SceneImage[], incoming: SceneImage[]): SceneImage[] {
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

function readProgress(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const p = (data as Record<string, unknown>).progress;
  if (typeof p !== "number" || Number.isNaN(p)) return null;
  return Math.min(100, Math.max(0, p));
}

function readTotalCost(data: unknown): number | null {
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

/** Normalize GET /api/images/:id body (root or { data: project }). */
function parseImagesProjectResponse(raw: unknown): {
  scenes: SceneImage[];
  progress: number | null;
  totalCost: number | null;
} | null {
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
  if (
    !project &&
    (Array.isArray(root.images) || Array.isArray(root.scenes))
  ) {
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

  return { scenes, progress, totalCost };
}

function isCompletedStatus(status: string | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "completed" || s === "complete" || s === "done";
}

function sceneBadgeVariant(img: SceneImage): "processing" | "done" | "failed" {
  const s = (img.status ?? "").toLowerCase();
  if (s === "failed" || s === "error" || s === "cancelled") return "failed";
  if (img.imageUrl) return "done";
  if (isCompletedStatus(img.status)) return "done";
  return "processing";
}

function sceneBadgeLabel(img: SceneImage): string {
  const v = sceneBadgeVariant(img);
  if (v === "failed") return "Failed";
  if (v === "done") return "Done";
  return "Processing";
}

async function handleDownload(url: string, sceneNumber: number) {
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

type HistoryProject = Record<string, unknown>;

function historyProjectId(p: HistoryProject): string | null {
  const raw = p.projectId ?? p._id ?? p.id;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return null;
}

function historyProjectIsFavorite(p: HistoryProject): boolean {
  const v = p.isFavorite ?? p.is_favorite ?? p.favorite;
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1") return true;
  if (v === "true") return true;
  return false;
}

function historyCreatedLabel(p: HistoryProject): string | null {
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

function historyCreatedTime(p: HistoryProject): number {
  const raw = p.createdAt ?? p.created_at;
  if (typeof raw !== "string") return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function historyFirstThumb(p: HistoryProject): string | null {
  return normalizeImageUrl(p.thumbnail);
}

function historyPromptLabel(p: HistoryProject): string {
  const t = p.prompt;
  return typeof t === "string" ? t : "";
}

function historyProgressPercent(p: HistoryProject): number | null {
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

/** Progress for history row: `progress` field or completedScenes / totalScenes. */
function historyProgressLabel(p: HistoryProject): string {
  const pct = historyProgressPercent(p);
  return pct == null ? "—" : `${pct}%`;
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11 4c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm7.5 15.5-2.39-2.39c-.5-.5-1.31-.5-1.81 0L14 18.09l-1.09-1.09c-.5-.5-1.31-.5-1.81 0l-2.39 2.39c-.5.5-.5 1.31 0 1.81l2.39 2.39c.5.5 1.31.5 1.81 0L14 21.91l1.09 1.09c.5.5 1.31.5 1.81 0l2.39-2.39c.5-.5.5-1.31 0-1.81zM3 21h6v-2H3v2z" />
    </svg>
  );
}

export default function ImagesStudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [sceneCount, setSceneCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [images, setImages] = useState<SceneImage[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [projectFailed, setProjectFailed] = useState(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(
    null
  );
  const [previewScene, setPreviewScene] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryProject[]>([]);
  const [historySearch, setHistorySearch] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const prevUrlCountRef = useRef(0);
  const handleImageUpdateRef = useRef<(data: unknown) => void>(() => {});
  const progressRef = useRef(0);
  progressRef.current = progress;

  const authHeaders = useCallback((): Record<string, string> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token) router.replace("/login");
  }, [router]);

  // Filled in once `sortedImages` is defined; declared here so it stays
  // close to the close/prev/next handlers.

  const handleLogout = () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
    } catch {
      /* ignore */
    }
    router.replace("/login");
  };

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    try {
      localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
    } catch {
      /* ignore */
    }
    setImages([]);
    setProjectId(null);
    setProgress(0);
    setTotalCost(null);
    setProjectFailed(false);
    setError(null);
    prevUrlCountRef.current = 0;
    disconnectSocket();
  }, [disconnectSocket]);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("[history] no access_token, skipping fetch");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      console.log("[history] GET /api/images", res.status, data);
      if (!res.ok || data == null) return;
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: unknown }).data)
          ? ((data as { data: unknown[] }).data)
          : Array.isArray((data as { images?: unknown }).images)
            ? ((data as { images: unknown[] }).images)
            : [];
      setHistory(list as HistoryProject[]);
    } catch (err) {
      console.log("[history] fetch error", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    void fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const q = historySearch.trim();
    if (q === "") {
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
          const res = await fetch(
            `${API_BASE}/api/images/search/${encodeURIComponent(q)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json().catch(() => null);
          if (!res.ok || data == null) return;
          setHistory(Array.isArray(data.data) ? data.data : []);
        } catch {
          /* ignore */
        }
      })();
    }, 300);
    return () => clearTimeout(t);
  }, [historySearch, fetchHistory]);

  useEffect(() => {
    if (historySearch.trim() === "") {
      void fetchHistory();
    }
  }, [historySearch, fetchHistory]);

  const loadProject = useCallback((id: string) => {
    try {
      localStorage.setItem(LAST_IMAGE_PROJECT_KEY, id);
    } catch {
      /* ignore */
    }
    setProjectId(id);
    setImages([]);
  }, []);

  const toggleHistoryFavorite = useCallback(
    async (e: React.MouseEvent, id: string, wasFavorite: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !wasFavorite;
      setHistory((prev) =>
        prev.map((p) =>
          historyProjectId(p) === id ? { ...p, isFavorite: next } : p
        )
      );
      try {
        const res = await fetch(`${API_BASE}/api/images/${id}/favorite`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ isFavorite: next }),
        });
        if (!res.ok) {
          setHistory((prev) =>
            prev.map((p) =>
              historyProjectId(p) === id ? { ...p, isFavorite: wasFavorite } : p
            )
          );
          return;
        }
        const data = await res.json().catch(() => null);
        if (data && typeof data === "object") {
          const d = data as Record<string, unknown>;
          const payload =
            d.data !== undefined && typeof d.data === "object" && d.data !== null
              ? (d.data as Record<string, unknown>)
              : d;
          const serverFav = payload.isFavorite ?? payload.is_favorite;
          if (typeof serverFav === "boolean") {
            setHistory((prev) =>
              prev.map((p) =>
                historyProjectId(p) === id ? { ...p, isFavorite: serverFav } : p
              )
            );
          }
        }
      } catch {
        setHistory((prev) =>
          prev.map((p) =>
            historyProjectId(p) === id ? { ...p, isFavorite: wasFavorite } : p
          )
        );
      }
    },
    [authHeaders]
  );

  const deleteHistoryProject = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm("Are you sure?")) return;

      const wasCurrent = projectId === id;
      try {
        const res = await fetch(`${API_BASE}/api/images/${id}`, {
          method: "DELETE",
          headers: { ...authHeaders() },
        });
        if (!res.ok) {
          setError("Could not delete project. Try again.");
          return;
        }
        setError(null);
        setHistory((prev) =>
          prev.filter((p) => historyProjectId(p) !== id)
        );
        if (wasCurrent) {
          try {
            localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
          } catch {
            /* ignore */
          }
          setProjectId(null);
          setImages([]);
          setProgress(0);
          setTotalCost(null);
          setProjectFailed(false);
          setPreviewScene(null);
          prevUrlCountRef.current = 0;
          disconnectSocket();
        }
      } catch {
        setError("Could not delete project. Try again.");
      }
    },
    [authHeaders, disconnectSocket, projectId]
  );

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const fa = historyProjectIsFavorite(a) ? 1 : 0;
      const fb = historyProjectIsFavorite(b) ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return historyCreatedTime(b) - historyCreatedTime(a);
    });
  }, [history]);

  useEffect(() => {
    if (!projectId || projectFailed) return;
    let cancelled = false;

    async function fetchProject() {
      try {
        const res = await fetch(`${API_BASE}/api/images/${projectId}`, {
          headers: { ...authHeaders() },
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.status === 404 || res.status === 403) {
          try {
            localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
          } catch {
            /* ignore */
          }
          setProjectId(null);
          setImages([]);
          return;
        }

        if (!res.ok || !data) return;

        if (typeof data === "object" && data !== null) {
          const st = String(
            (data as Record<string, unknown>).status ?? ""
          ).toLowerCase();
          if (st === "failed" || st === "error" || st === "cancelled") {
            setError(
              typeof (data as Record<string, unknown>).message === "string"
                ? String((data as Record<string, unknown>).message)
                : "Image generation failed."
            );
            setLoading(false);
            setProjectFailed(true);
            disconnectSocket();
            try {
              localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
            } catch {
              /* ignore */
            }
            return;
          }
        }

        const parsed = parseImagesProjectResponse(data);
        if (!parsed || cancelled) return;

        setImages((prev) => {
          if (parsed.scenes.length === 0) return prev;
          if (prev.length === 0) return parsed.scenes;
          return mergeScenes(prev, parsed.scenes);
        });

        let prog = parsed.progress;
        if (
          parsed.scenes.length > 0 &&
          parsed.scenes.every((s) => Boolean(s.imageUrl))
        ) {
          prog = 100;
        }
        if (prog != null) {
          setProgress(Math.min(100, Math.max(0, prog)));
        }
        if (parsed.totalCost != null) setTotalCost(parsed.totalCost);

        if (
          parsed.scenes.length > 0 &&
          parsed.scenes.every((s) => Boolean(s.imageUrl))
        ) {
          setProgress(100);
          setLoading(false);
        }
      } catch {
        /* ignore */
      }
    }

    void fetchProject();
    return () => {
      cancelled = true;
    };
  }, [projectId, projectFailed, authHeaders, disconnectSocket]);

  const handleImageUpdate = useCallback((data: unknown) => {
    if (!data || typeof data !== "object") return;
    const payload = data as Record<string, unknown>;
    const sceneRaw = payload.sceneNumber ?? payload.scene_number;
    const sceneNumber =
      typeof sceneRaw === "number" ? sceneRaw : Number(sceneRaw);
    if (!Number.isFinite(sceneNumber)) return;

    const progressRaw = payload.progress;
    if (typeof progressRaw === "number" && !Number.isNaN(progressRaw)) {
      setProgress(Math.min(100, Math.max(0, progressRaw)));
    }

    const rawUrl = normalizeImageUrl(
      payload.imageUrl ?? payload.image_url
    );
    const status =
      typeof payload.status === "string" ? payload.status : undefined;
    const completed = isCompletedStatus(status);

    if (rawUrl == null && !completed) {
      setImages((prev) => {
        const existing = prev.find((img) => img.scene_number === sceneNumber);
        if (!existing) {
          if (status == null) return prev;
          return [
            ...prev,
            {
              scene_number: sceneNumber,
              imageUrl: null,
              status,
            },
          ];
        }
        return prev.map((img) =>
          img.scene_number === sceneNumber
            ? {
                ...img,
                ...(status != null ? { status } : {}),
              }
            : img
        );
      });
      return;
    }

    setImages((prev) => {
      const existing = prev.find((img) => img.scene_number === sceneNumber);
      const nextUrl =
        rawUrl != null
          ? rawUrl
          : existing?.imageUrl != null
            ? existing.imageUrl
            : null;
      const nextPatch: SceneImage = {
        scene_number: sceneNumber,
        imageUrl: nextUrl,
        ...(status != null ? { status } : {}),
      };
      if (existing) {
        return prev.map((img) =>
          img.scene_number === sceneNumber ? { ...img, ...nextPatch } : img
        );
      }
      return [
        ...prev,
        {
          scene_number: sceneNumber,
          imageUrl: nextUrl,
          status: status ?? "pending",
        },
      ];
    });
  }, []);

  handleImageUpdateRef.current = handleImageUpdate;

  useEffect(() => {
    if (!projectId || projectFailed) {
      disconnectSocket();
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket: Socket = io(`${API_BASE}/images`, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit("joinProject", { projectId });

    socket.on("image_update", (payload: unknown) => {
      handleImageUpdateRef.current(payload);
    });

    socket.on("project_failed", (payload: unknown) => {
      const msg =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : "Image generation failed.";
      setError(msg);
      setLoading(false);
      setProjectFailed(true);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      disconnectSocket();
    });

    return () => {
      socket.off("image_update");
      socket.off("project_failed");
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [projectId, projectFailed, disconnectSocket]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, [disconnectSocket]);

  useEffect(() => {
    if (!projectId || sceneCount <= 0 || progress >= 100 || projectFailed)
      return;
    if (
      images.length >= sceneCount &&
      images.every((i) => Boolean(i.imageUrl))
    ) {
      setProgress(100);
    }
  }, [projectId, sceneCount, images, progress, projectFailed]);

  useEffect(() => {
    if (!projectId || projectFailed) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let stopped = false;

    const clearPollInterval = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    let latestProgressFromPoll: number | null = null;

    const pollOnce = async () => {
      if (stopped || progressRef.current >= 100) {
        clearPollInterval();
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/images/${projectId}`, {
          headers: { ...authHeaders() },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) return;

        if (typeof data === "object" && data !== null) {
          const st = String(
            (data as Record<string, unknown>).status ?? ""
          ).toLowerCase();
          if (st === "failed" || st === "error" || st === "cancelled") {
            const msg =
              typeof (data as Record<string, unknown>).message === "string"
                ? String((data as Record<string, unknown>).message)
                : "Image generation failed.";
            setError(msg);
            setLoading(false);
            setProjectFailed(true);
            disconnectSocket();
            clearPollInterval();
            return;
          }
        }

        const cost = readTotalCost(data);
        if (cost != null) setTotalCost(cost);
        const p = readProgress(data);
        if (p != null) {
          latestProgressFromPoll = p;
          setProgress(p);
          if (p >= 100) clearPollInterval();
        }
        const scenes = scenesFromPayload(data);
        if (scenes.length > 0) {
          setImages((prev) => mergeScenes(prev, scenes));
        }
      } catch {
        /* keep polling */
      }
    };

    void (async () => {
      await pollOnce();
      if (
        stopped ||
        (latestProgressFromPoll != null && latestProgressFromPoll >= 100)
      )
        return;
      intervalId = setInterval(() => void pollOnce(), 3000);
    })();

    return () => {
      stopped = true;
      clearPollInterval();
    };
  }, [projectId, projectFailed, authHeaders, disconnectSocket]);

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => a.scene_number - b.scene_number);
  }, [images]);

  const handleDownloadAll = useCallback(() => {
    sortedImages.forEach((img) => {
      if (!img.imageUrl) return;
      void handleDownload(img.imageUrl, img.scene_number);
    });
  }, [sortedImages]);

  const viewableImages = useMemo(
    () => sortedImages.filter((i): i is SceneImage & { imageUrl: string } =>
      Boolean(i.imageUrl)
    ),
    [sortedImages]
  );
  const previewIdx = useMemo(() => {
    if (previewScene == null) return -1;
    return viewableImages.findIndex((i) => i.scene_number === previewScene);
  }, [previewScene, viewableImages]);
  const previewItem = previewIdx >= 0 ? viewableImages[previewIdx] : null;

  useEffect(() => {
    if (previewScene != null && previewIdx < 0 && viewableImages.length === 0) {
      setPreviewScene(null);
    }
  }, [previewScene, previewIdx, viewableImages.length]);

  const closePreview = useCallback(() => setPreviewScene(null), []);
  const showPrev = useCallback(() => {
    if (viewableImages.length === 0) return;
    const base = previewIdx >= 0 ? previewIdx : 0;
    const next =
      (base - 1 + viewableImages.length) % viewableImages.length;
    setPreviewScene(viewableImages[next].scene_number);
  }, [viewableImages, previewIdx]);
  const showNext = useCallback(() => {
    if (viewableImages.length === 0) return;
    const base = previewIdx >= 0 ? previewIdx : -1;
    const next = (base + 1) % viewableImages.length;
    setPreviewScene(viewableImages[next].scene_number);
  }, [viewableImages, previewIdx]);

  useEffect(() => {
    console.log("[preview] state", previewScene, "item:", previewItem);
  }, [previewScene, previewItem]);

  useEffect(() => {
    if (previewScene == null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewScene, closePreview, showPrev, showNext]);

  useEffect(() => {
    const withUrl = sortedImages.filter((i) => Boolean(i.imageUrl)).length;
    if (withUrl > prevUrlCountRef.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    prevUrlCountRef.current = withUrl;
  }, [sortedImages]);

  const handleRegenerate = async (sceneNumber: number) => {
    if (!projectId) return;
    setRegeneratingScene(sceneNumber);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/images/${projectId}/regenerate/${sceneNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "message" in data
            ? String((data as { message: unknown }).message)
            : "Could not regenerate this scene.";
        setError(msg);
        return;
      }
      const url = normalizeImageUrl(
        data && typeof data === "object"
          ? (data as Record<string, unknown>).imageUrl ??
              (data as Record<string, unknown>).image_url
          : null
      );
      const fromPayload = scenesFromPayload(data);
      const patch =
        fromPayload.find((s) => s.scene_number === sceneNumber) ??
        (url != null
          ? {
              scene_number: sceneNumber,
              imageUrl: url,
              status: "completed",
            }
          : null);
      if (patch) {
        setImages((prev) =>
          prev.some((i) => i.scene_number === sceneNumber)
            ? prev.map((img) =>
                img.scene_number === sceneNumber
                  ? {
                      ...img,
                      imageUrl:
                        patch.imageUrl != null && patch.imageUrl !== ""
                          ? patch.imageUrl
                          : img.imageUrl ?? null,
                      status: patch.status ?? img.status,
                    }
                  : img
              )
            : [...prev, patch]
        );
      }
    } catch {
      setError("Network error while regenerating. Try again.");
    } finally {
      setRegeneratingScene(null);
    }
  };

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Describe your images first—what should we create?");
      return;
    }
    setError(null);
    setLoading(true);
    setProjectFailed(false);
    disconnectSocket();
    setProjectId(null);
    setImages([]);
    setProgress(0);
    setTotalCost(null);
    prevUrlCountRef.current = 0;

    try {
      const res = await fetch(`${API_BASE}/api/images/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          prompt: trimmed,
          sceneCount,
          async: true,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "message" in data
            ? String((data as { message: unknown }).message)
            : "Could not start generation. Try again.";
        setError(msg);
        return;
      }

      const id = extractProjectId(data);
      if (!id) {
        setError("No project id returned. Check your API response.");
        return;
      }

      setProjectId(id);
      setProgress(0);
      setImages(
        Array.from({ length: sceneCount }, (_, i) => ({
          scene_number: i + 1,
          imageUrl: null,
          status: "pending",
        }))
      );
      try {
        localStorage.setItem(LAST_IMAGE_PROJECT_KEY, id);
      } catch {
        /* ignore */
      }
      setHistorySearch("");
      await fetchHistory();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const showLoader = Boolean(
    loading ||
      (projectId !== null && progress < 100 && !projectFailed)
  );

  const handleRetryGeneration = () => {
    setError(null);
    void handleGenerate();
  };

  return (
    <div className="font-sans relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <PageShell className="relative z-10 !py-6 pb-16 sm:!py-8">
        <header className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-50 blur-md" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/25 ring-1 ring-white/15">
                <span className="text-base font-bold text-white">L</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Lene
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Images
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleClearHistory}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/15 hover:text-white"
            >
              Clear history
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            >
              Video studio
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-violet-300/90">
            <WandIcon className="h-3.5 w-3.5" />
            Text → images
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Describe it.
            </span>{" "}
            <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
              Watch scenes appear live.
            </span>
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
            Write a clear prompt—subject, mood, lighting—and generate multiple
            scenes. Images stream into the grid as each finishes.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 xl:gap-10">
          <aside className="relative lg:sticky lg:top-6 lg:self-start">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/15 opacity-60 blur-sm" />
            <div className="relative flex max-h-[min(60vh,520px)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/55 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.55)] backdrop-blur-xl">
              <div className="border-b border-white/[0.06] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Your history
                </p>
              </div>
              <div className="border-b border-white/[0.06] px-3 py-2">
                <label htmlFor="history-search" className="sr-only">
                  Search history
                </label>
                <input
                  id="history-search"
                  type="search"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search…"
                  autoComplete="off"
                  className="w-full rounded-lg border border-white/[0.09] bg-zinc-900/50 px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_2px_rgb(139_92_246/0.12)]"
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {history.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm leading-relaxed text-zinc-500">
                    Generate your first images
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedHistory.map((proj) => {
                      const hid = historyProjectId(proj);
                      if (!hid) return null;
                      const thumb = historyFirstThumb(proj);
                      const active = projectId === hid;
                      const prog = historyProgressLabel(proj);
                      const created = historyCreatedLabel(proj);
                      const favorite = historyProjectIsFavorite(proj);
                      return (
                        <div
                          key={hid}
                          role="button"
                          tabIndex={0}
                          onClick={() => loadProject(hid)}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              loadProject(hid);
                            }
                          }}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                            active
                              ? "border-violet-500/35 bg-violet-500/10 ring-1 ring-violet-500/25"
                              : "border-white/[0.06] bg-zinc-900/80 hover:border-white/10 hover:bg-zinc-800/90"
                          }`}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-800/80">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                                {historyProgressPercent(proj) === 100
                                  ? "Ready"
                                  : "…"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-100">
                              {historyPromptLabel(proj) || "Untitled project"}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                              {prog}
                              {created ? <span> · {created}</span> : null}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={(ev) =>
                                void toggleHistoryFavorite(ev, hid, favorite)
                              }
                              className="rounded-md p-1 text-base leading-none text-amber-300/90 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                              aria-label={
                                favorite
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              aria-pressed={favorite}
                            >
                              {favorite ? "⭐" : "☆"}
                            </button>
                            <button
                              type="button"
                              onClick={(ev) => void deleteHistoryProject(ev, hid)}
                              className="rounded-md p-1 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                              aria-label="Delete project"
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                                aria-hidden="true"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/25 via-transparent to-fuchsia-500/20 opacity-70 blur-sm" />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/55 p-6 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.55)] backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

              <label
                htmlFor="image-prompt"
                className="mb-3 flex items-center justify-between gap-2"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Prompt
                </span>
                <span className="text-xs text-zinc-600">{prompt.length} chars</span>
              </label>
              <textarea
                id="image-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                placeholder="Example: Neon alley at night, rain on cobblestones, cinematic rim light, shallow depth of field…"
                className="mb-6 w-full resize-none rounded-xl border border-white/[0.09] bg-zinc-900/45 px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
              />

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Scene count
              </p>
              <div className="mb-8 flex flex-wrap gap-2">
                {[3, 5, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSceneCount(n)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      sceneCount === n
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_-4px_rgb(139_92_246/0.4)]"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                    }`}
                  >
                    {n} scenes
                  </button>
                ))}
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-500/30 bg-red-500/[0.12] px-4 py-3 text-sm text-red-100/95"
                >
                  <p className="leading-relaxed">{error}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-xs font-medium text-zinc-400 transition hover:text-white"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={handleRetryGeneration}
                      className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : null}

              <Button
                type="button"
                variant="heroPrimary"
                onClick={handleGenerate}
                loading={showLoader}
                loadingLabel={projectId ? "Generating…" : "Starting…"}
              >
                <>
                  <ImageIcon className="h-5 w-5 opacity-90" />
                  Generate images
                </>
              </Button>

              <p className="mt-4 text-center text-[11px] text-zinc-600">
                More scenes take longer—fewer scenes return faster previews.
              </p>
            </div>
          </div>

          <div className="relative flex min-h-[320px] flex-col lg:min-h-[480px]">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-transparent to-cyan-500/10 opacity-80 blur-[1px]" />
            <div className="relative flex min-h-[inherit] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/40 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl">
              <div className="flex flex-col gap-2 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Live grid
                  </span>
                  {projectFailed ? (
                    <Badge variant="failed">Failed</Badge>
                  ) : progress >= 100 ? (
                    <Badge variant="done">Ready</Badge>
                  ) : showLoader ? (
                    <Badge variant="processing">Processing</Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {sortedImages.some((i) => Boolean(i.imageUrl)) ? (
                    <button
                      type="button"
                      onClick={handleDownloadAll}
                      className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-violet-500/35 hover:bg-violet-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                    >
                      Download all images
                    </button>
                  ) : null}
                  {totalCost != null ? (
                    <span className="text-xs text-zinc-500">
                      Total Cost:{" "}
                      <span className="font-medium text-zinc-200">
                        ${totalCost.toFixed(2)}
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div
                ref={scrollAreaRef}
                className="relative flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6"
              >
                {projectId !== null && progress < 100 && !projectFailed ? (
                  <ProgressCard
                    progress={progress}
                    status="Generating images..."
                    className="border-white/[0.08] bg-zinc-950/40 text-left shadow-none"
                  />
                ) : null}

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {sortedImages.map((img) => (
                      <div
                        key={img.scene_number}
                        className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/60 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]"
                      >
                        <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-sm">
                          Scene {img.scene_number}
                        </div>
                        <div className="pointer-events-none absolute right-2 top-2 z-20">
                          <Badge variant={sceneBadgeVariant(img)}>
                            {sceneBadgeLabel(img)}
                          </Badge>
                        </div>

                        {img.imageUrl ? (
                          <>
                            <img
                              src={img.imageUrl}
                              alt={`Scene ${img.scene_number}`}
                              onClick={() => {
                                console.log(
                                  "[preview] image click",
                                  img.scene_number
                                );
                                setPreviewScene(img.scene_number);
                              }}
                              className="block h-44 w-full cursor-pointer object-cover transition duration-300 group-hover:scale-[1.04] sm:h-48 md:h-44 lg:h-48"
                            />
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "[preview] preview btn",
                                    img.scene_number
                                  );
                                  setPreviewScene(img.scene_number);
                                }}
                                className="pointer-events-auto rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "[preview] download",
                                    img.scene_number
                                  );
                                  void handleDownload(
                                    img.imageUrl!,
                                    img.scene_number
                                  );
                                }}
                                className="pointer-events-auto rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_6px_20px_-6px_rgb(139_92_246/0.6)] transition hover:bg-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                              >
                                Download
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-44 w-full animate-pulse items-center justify-center bg-zinc-800/60 text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:h-48 md:h-44 lg:h-48">
                            Generating…
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-zinc-600">
                      <ImageIcon className="h-11 w-11" />
                    </div>
                    <p className="text-sm font-medium text-zinc-300">
                      No images yet
                    </p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
                      Add a prompt on the left and hit generate. Scenes will
                      appear here as they finish.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageShell>

      {previewScene !== null ? (
        (() => {
          const fallback =
            previewItem ??
            sortedImages.find((i) => i.scene_number === previewScene) ??
            null;
          if (!fallback || !fallback.imageUrl) return null;
          const total = viewableImages.length;
          const positionLabel =
            previewIdx >= 0 && total > 0
              ? `${previewIdx + 1} / ${total}`
              : `${fallback.scene_number}`;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label={`Scene ${fallback.scene_number} preview`}
              onClick={closePreview}
            >
              <div
                className="relative w-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute left-3 top-3 z-10 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm sm:left-4 sm:top-4">
                  Scene {fallback.scene_number} · {positionLabel}
                </div>

                <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-4 sm:top-4">
                  <button
                    type="button"
                    onClick={() =>
                      void handleDownload(
                        fallback.imageUrl!,
                        fallback.scene_number
                      )
                    }
                    className="rounded-lg bg-violet-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_6px_20px_-6px_rgb(139_92_246/0.6)] transition hover:bg-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={closePreview}
                    className="rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                    aria-label="Close preview"
                  >
                    ✕
                  </button>
                </div>

                <img
                  key={fallback.scene_number}
                  src={fallback.imageUrl}
                  alt={`Scene ${fallback.scene_number}`}
                  className="max-h-[85vh] w-full rounded-xl object-contain"
                />

                {total > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPrev();
                      }}
                      className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:left-4 sm:h-12 sm:w-12"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showNext();
                      }}
                      className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:right-4 sm:h-12 sm:w-12"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })()
      ) : null}
    </div>
  );
}
