import { API_BASE, getApiErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { io, type Socket } from "socket.io-client";
import {
  deleteImageProject,
  generateImages,
  getImageProject,
  listImageProjects,
  renderVideoFromImages,
  type RenderVideoFromImagesBody,
  searchImageProjects,
  setImageProjectFavorite,
} from "../api";
import { SLIDESHOW_DEFAULT_VOICE_ID } from "../slideshow-defaults";
import type { ImageProject, SceneImage } from "../types";
import {
  downloadImage,
  extractProjectId,
  getProjectPayload,
  historyCreatedTime,
  historyProjectId,
  historyProjectIsFavorite,
  isCompletedStatus,
  LAST_IMAGE_PROJECT_KEY,
  mergeScenes,
  normalizeImageUrl,
  parseImagesProjectResponse,
} from "../utils";

function projectStatusFailure(
  data: unknown
):
  | { fail: true; message: string }
  | { fail: false } {
  const inner = getProjectPayload(data);
  if (!inner) return { fail: false };
  const st = String(inner.status ?? "").toLowerCase();
  if (st === "failed" || st === "error" || st === "cancelled") {
    return {
      fail: true,
      message:
        typeof inner.message === "string" ? inner.message : "Image generation failed.",
    };
  }
  return { fail: false };
}

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function imageProjectsFromPayload(data: unknown): ImageProject[] {
  if (Array.isArray(data)) return data as ImageProject[];
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.data)) return d.data as ImageProject[];
  if (Array.isArray(d.images)) return d.images as ImageProject[];
  return [];
}

export function useImagesStudio() {
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoRenderLoading, setVideoRenderLoading] = useState(false);
  /** Slideshow total length; sent as `videoDurationSeconds` (1–86400) to render API. */
  const [slideshowVideoDuration, setSlideshowVideoDuration] = useState(60);
  const [slideshowIncludeNarration, setSlideshowIncludeNarration] = useState(true);
  const [slideshowIncludeMusic, setSlideshowIncludeMusic] = useState(false);
  const [slideshowVoiceId, setSlideshowVoiceId] = useState(
    SLIDESHOW_DEFAULT_VOICE_ID
  );
  const [previewScene, setPreviewScene] = useState<number | null>(null);
  const [history, setHistory] = useState<ImageProject[]>([]);
  const [historySearch, setHistorySearch] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const prevUrlCountRef = useRef(0);
  const handleImageUpdateRef = useRef<(data: unknown) => void>(() => {});
  const progressRef = useRef(0);
  progressRef.current = progress;

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) router.replace("/login");
  }, [router]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not fetch image history."));
    }
    router.replace("/login");
  }, [router]);

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
    setVideoUrl(null);
    setVideoStatus(null);
    setVideoError(null);
    setVideoRenderLoading(false);
    setSlideshowVideoDuration(60);
    setSlideshowIncludeNarration(true);
    setSlideshowIncludeMusic(false);
    setSlideshowVoiceId(SLIDESHOW_DEFAULT_VOICE_ID);
    setProjectFailed(false);
    setError(null);
    prevUrlCountRef.current = 0;
    disconnectSocket();
  }, [disconnectSocket]);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const { res, data } = await listImageProjects(token);
      if (!res.ok || data == null) return;
      setHistory(imageProjectsFromPayload(data));
    } catch {
      /* ignore */
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
    if (q === "") return;

    const t = window.setTimeout(() => {
      void (async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
          const { res, data } = await searchImageProjects({ query: q, token });
          if (!res.ok || data == null) return;
          setHistory(imageProjectsFromPayload(data));
        } catch (err) {
          setError(getApiErrorMessage(err, "Could not search image history."));
        }
      })();
    }, 300);
    return () => clearTimeout(t);
  }, [historySearch]);

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
    setVideoUrl(null);
    setVideoStatus(null);
    setVideoError(null);
    setVideoRenderLoading(false);
    setSlideshowVideoDuration(60);
    setSlideshowIncludeNarration(true);
    setSlideshowIncludeMusic(false);
    setSlideshowVoiceId(SLIDESHOW_DEFAULT_VOICE_ID);
  }, []);

  const toggleHistoryFavorite = useCallback(
    async (e: MouseEvent, id: string, wasFavorite: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !wasFavorite;
      setHistory((prev) =>
        prev.map((p) =>
          historyProjectId(p) === id ? { ...p, isFavorite: next } : p
        )
      );
      try {
        const { data } = await setImageProjectFavorite({
          id,
          isFavorite: next,
          headers: authHeaders(),
        });
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
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not update favorite."));
        setHistory((prev) =>
          prev.map((p) =>
            historyProjectId(p) === id ? { ...p, isFavorite: wasFavorite } : p
          )
        );
      }
    },
    []
  );

  const deleteHistoryProject = useCallback(
    async (e: MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm("Are you sure?")) return;

      const wasCurrent = projectId === id;
      try {
        const { res } = await deleteImageProject({ id, headers: authHeaders() });
        if (!res.ok) {
          setError("Could not delete project. Try again.");
          return;
        }
        setError(null);
        setHistory((prev) => prev.filter((p) => historyProjectId(p) !== id));
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
          setVideoUrl(null);
          setVideoStatus(null);
          setVideoError(null);
          setVideoRenderLoading(false);
          setSlideshowVideoDuration(60);
          setSlideshowIncludeNarration(true);
          setSlideshowIncludeMusic(false);
          setSlideshowVoiceId(SLIDESHOW_DEFAULT_VOICE_ID);
          setProjectFailed(false);
          setPreviewScene(null);
          prevUrlCountRef.current = 0;
          disconnectSocket();
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not delete project. Try again."));
      }
    },
    [disconnectSocket, projectId]
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
        const { res, data } = await getImageProject({
          id: projectId!,
          headers: authHeaders(),
        });
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

        const failed = projectStatusFailure(data);
        if (failed.fail) {
          setError(failed.message);
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
        if (prog != null) setProgress(Math.min(100, Math.max(0, prog)));
        if (parsed.totalCost != null) setTotalCost(parsed.totalCost);

        setVideoUrl(parsed.videoUrl);
        setVideoStatus(parsed.videoStatus);
        setVideoError(parsed.videoError);

        if (
          parsed.scenes.length > 0 &&
          parsed.scenes.every((s) => Boolean(s.imageUrl))
        ) {
          setProgress(100);
          setLoading(false);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load image project."));
      }
    }

    void fetchProject();
    return () => {
      cancelled = true;
    };
  }, [projectId, projectFailed, disconnectSocket]);

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

    const rawUrl = normalizeImageUrl(payload.imageUrl ?? payload.image_url);
    const status =
      typeof payload.status === "string" ? payload.status : undefined;
    const completed = isCompletedStatus(status);

    if (rawUrl == null && !completed) {
      setImages((prev) => {
        const existing = prev.find((img) => img.scene_number === sceneNumber);
        if (!existing) {
          if (status == null) return prev;
          return [...prev, { scene_number: sceneNumber, imageUrl: null, status }];
        }
        return prev.map((img) =>
          img.scene_number === sceneNumber
            ? { ...img, ...(status != null ? { status } : {}) }
            : img
        );
      });
      return;
    }

    setImages((prev) => {
      const existing = prev.find((img) => img.scene_number === sceneNumber);
      const nextUrl =
        rawUrl != null ? rawUrl : existing?.imageUrl != null ? existing.imageUrl : null;
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

    const socket: Socket = io(`${API_BASE}/images`, { auth: { token } });
    socketRef.current = socket;
    socket.emit("joinProject", { projectId });
    const onImageUpdate = (payload: unknown) => {
      handleImageUpdateRef.current(payload);
    };
    const onProjectFailed = (payload: unknown) => {
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
    };

    socket.on("image_update", onImageUpdate);
    socket.on("project_failed", onProjectFailed);

    return () => {
      socket.off("image_update", onImageUpdate);
      socket.off("project_failed", onProjectFailed);
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
    if (!projectId || sceneCount <= 0 || progress >= 100 || projectFailed) return;
    if (
      images.length >= sceneCount &&
      images.every((i) => Boolean(i.imageUrl))
    ) {
      setProgress(100);
    }
  }, [projectId, sceneCount, images, progress, projectFailed]);

  const shouldPollProject = useMemo(() => {
    if (!projectId || projectFailed) return false;
    if (progress < 100) return true;
    const v = (videoStatus ?? "").toLowerCase();
    return v === "queued" || v === "processing";
  }, [projectId, projectFailed, progress, videoStatus]);

  useEffect(() => {
    if (!shouldPollProject || !projectId) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let stopped = false;
    const id = projectId;

    const clearPollInterval = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const pollOnce = async () => {
      if (stopped) return;
      try {
        const { res, data } = await getImageProject({
          id,
          headers: authHeaders(),
        });

        if (res.status === 404 || res.status === 403) {
          try {
            localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
          } catch {
            /* ignore */
          }
          setProjectId(null);
          setImages([]);
          clearPollInterval();
          return;
        }

        if (!res.ok || !data) return;

        const fail = projectStatusFailure(data);
        if (fail.fail) {
          setError(fail.message);
          setLoading(false);
          setProjectFailed(true);
          disconnectSocket();
          clearPollInterval();
          return;
        }

        const parsed = parseImagesProjectResponse(data);
        if (!parsed) return;

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
        if (prog != null) setProgress(Math.min(100, Math.max(0, prog)));
        if (parsed.totalCost != null) setTotalCost(parsed.totalCost);

        setVideoUrl(parsed.videoUrl);
        setVideoStatus(parsed.videoStatus);
        setVideoError(parsed.videoError);

        if (
          parsed.scenes.length > 0 &&
          parsed.scenes.every((s) => Boolean(s.imageUrl))
        ) {
          setProgress(100);
          setLoading(false);
        }
      } catch (err) {
        const msg = getApiErrorMessage(err, "");
        if (msg && progressRef.current === 0) setError(msg);
      }
    };

    void (async () => {
      await pollOnce();
      if (stopped) return;
      intervalId = setInterval(() => void pollOnce(), 3000);
    })();

    return () => {
      stopped = true;
      clearPollInterval();
    };
  }, [shouldPollProject, projectId, disconnectSocket]);

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => a.scene_number - b.scene_number);
  }, [images]);

  const handleDownloadAll = useCallback(() => {
    sortedImages.forEach((img) => {
      if (!img.imageUrl) return;
      void downloadImage(img.imageUrl, img.scene_number);
    });
  }, [sortedImages]);

  const viewableImages = useMemo(
    () =>
      sortedImages.filter(
        (i): i is SceneImage & { imageUrl: string } => Boolean(i.imageUrl)
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
    const next = (base - 1 + viewableImages.length) % viewableImages.length;
    setPreviewScene(viewableImages[next].scene_number);
  }, [viewableImages, previewIdx]);
  const showNext = useCallback(() => {
    if (viewableImages.length === 0) return;
    const base = previewIdx >= 0 ? previewIdx : -1;
    const next = (base + 1) % viewableImages.length;
    setPreviewScene(viewableImages[next].scene_number);
  }, [viewableImages, previewIdx]);

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

  const handleGenerate = useCallback(async () => {
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
    setVideoUrl(null);
    setVideoStatus(null);
    setVideoError(null);
    setVideoRenderLoading(false);
    setSlideshowVideoDuration(60);
    setSlideshowIncludeNarration(true);
    setSlideshowIncludeMusic(false);
    setSlideshowVoiceId(SLIDESHOW_DEFAULT_VOICE_ID);
    prevUrlCountRef.current = 0;

    try {
      const { data } = await generateImages({
        prompt: trimmed,
        sceneCount,
        headers: authHeaders(),
      });

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
    } catch (err) {
      setError(getApiErrorMessage(err, "Network error. Is the API running?"));
    } finally {
      setLoading(false);
    }
  }, [disconnectSocket, fetchHistory, prompt, sceneCount]);

  const canCreateSlideshow = useMemo(() => {
    if (!projectId || projectFailed) return false;
    if (progress < 100) return false;
    if (!images.some((i) => Boolean(i.imageUrl))) return false;
    const v = (videoStatus ?? "").toLowerCase();
    if (v === "queued" || v === "processing") return false;
    if (videoUrl) return false;
    if (videoRenderLoading) return false;
    return true;
  }, [
    projectId,
    projectFailed,
    progress,
    images,
    videoStatus,
    videoUrl,
    videoRenderLoading,
  ]);

  const handleCreateSlideshowVideo = useCallback(async () => {
    if (!projectId) return;
    setError(null);
    setVideoError(null);
    const seconds = Math.round(Number(slideshowVideoDuration));
    if (!Number.isFinite(seconds) || seconds < 1 || seconds > 86400) {
      setError("Video length must be between 1 and 86,400 seconds (24 hours).");
      return;
    }

    const body: RenderVideoFromImagesBody = {
      videoDurationSeconds: seconds,
      includeNarration: slideshowIncludeNarration,
      includeMusic: slideshowIncludeMusic,
    };
    const voice =
      slideshowVoiceId.trim() || SLIDESHOW_DEFAULT_VOICE_ID;
    if (voice) body.voiceId = voice;

    setVideoRenderLoading(true);
    try {
      const { res, data } = await renderVideoFromImages({
        projectId,
        body,
        headers: authHeaders(),
      });
      if (res.status === 409) {
        const msg =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
            ? String((data as { message: string }).message)
            : "A video is already being rendered for this project.";
        setError(msg);
        return;
      }
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
            ? String((data as { message: string }).message)
            : "Could not start video render.";
        setError(msg);
        return;
      }
      setVideoStatus("queued");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start video render."));
    } finally {
      setVideoRenderLoading(false);
    }
  }, [
    projectId,
    slideshowVideoDuration,
    slideshowIncludeNarration,
    slideshowIncludeMusic,
    slideshowVoiceId,
  ]);

  const showLoader = Boolean(
    loading || (projectId !== null && progress < 100 && !projectFailed)
  );

  const handleRetryGeneration = useCallback(() => {
    setError(null);
    void handleGenerate();
  }, [handleGenerate]);

  const setCustomSceneCount = useCallback((value: string) => {
    const v = parseInt(value, 10);
    if (Number.isNaN(v)) return;
    setSceneCount(Math.max(1, Math.min(20, v)));
  }, []);

  return {
    prompt,
    setPrompt,
    sceneCount,
    setSceneCount,
    setCustomSceneCount,
    projectId,
    progress,
    error,
    setError,
    projectFailed,
    totalCost,
    videoUrl,
    videoStatus,
    videoError,
    videoRenderLoading,
    canCreateSlideshow,
    slideshowVideoDuration,
    setSlideshowVideoDuration,
    slideshowIncludeNarration,
    setSlideshowIncludeNarration,
    slideshowIncludeMusic,
    setSlideshowIncludeMusic,
    slideshowVoiceId,
    setSlideshowVoiceId,
    handleCreateSlideshowVideo,
    previewScene,
    history,
    historySearch,
    setHistorySearch,
    sortedHistory,
    sortedImages,
    scrollAreaRef,
    showLoader,
    previewIdx,
    previewItem,
    viewableImages,
    handleLogout,
    handleClearHistory,
    loadProject,
    toggleHistoryFavorite,
    deleteHistoryProject,
    handleDownloadAll,
    handleGenerate,
    handleRetryGeneration,
    setPreviewScene,
    closePreview,
    showPrev,
    showNext,
    downloadImage,
  };
}

export type ImagesStudioState = ReturnType<typeof useImagesStudio>;
