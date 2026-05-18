import { LAST_PROJECT_STORAGE_KEY } from "@/features/studio/constants";
import {
  deleteStudioProject,
  generateStudioImages,
  renderStudioSlideshow,
  setStudioProjectFavorite,
} from "@/features/studio/api/facade";
import type { ProjectDetailPatch } from "@/features/studio/lib/apply-project-detail";
import {
  useProjectDetailSync,
  useProjectHistory,
  useProjectPoll,
  useSceneSocket,
  useSceneState,
  useStudioCatalog,
  getStudioAuthHeaders,
} from "@/features/studio/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { RenderVideoFromImagesBody } from "../api";
import { SLIDESHOW_DEFAULT_VOICE_ID } from "../slideshow-defaults";
import type { SceneImage } from "../types";
import {
  downloadImage,
  extractProjectId,
  historyProjectId,
} from "../utils";

export const LAST_IMAGE_PROJECT_KEY = LAST_PROJECT_STORAGE_KEY;

export function useImagesStudio() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [sceneCount, setSceneCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [projectFailed, setProjectFailed] = useState(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoRenderLoading, setVideoRenderLoading] = useState(false);
  const [slideshowVideoDuration, setSlideshowVideoDuration] = useState(60);
  const [slideshowIncludeNarration, setSlideshowIncludeNarration] = useState(true);
  const [slideshowIncludeMusic, setSlideshowIncludeMusic] = useState(false);
  const [slideshowVoiceId, setSlideshowVoiceId] = useState(
    SLIDESHOW_DEFAULT_VOICE_ID
  );
  const [previewScene, setPreviewScene] = useState<number | null>(null);

  const {
    scenes,
    sortedImages,
    storyboardId,
    resetScenes,
    seedPlaceholderScenes,
    applyDetailPatch: applyScenePatch,
    applySocketPayload,
  } = useSceneState();

  const {
    history,
    setHistory,
    historySearch,
    setHistorySearch,
    sortedHistory,
    historyLoading,
    fetchHistory,
  } = useProjectHistory();

  useStudioCatalog(true);

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const prevUrlCountRef = useRef(0);
  const progressRef = useRef(0);
  progressRef.current = progress;

  const applyProjectPatch = useCallback(
    (patch: ProjectDetailPatch) => {
      applyScenePatch(patch);
      if (patch.progress != null) {
        setProgress(Math.min(100, Math.max(0, patch.progress)));
      }
      if (patch.totalCost !== undefined) setTotalCost(patch.totalCost);
      if (patch.videoUrl !== undefined) setVideoUrl(patch.videoUrl);
      if (patch.videoStatus !== undefined) setVideoStatus(patch.videoStatus);
      if (patch.videoError !== undefined) setVideoError(patch.videoError);
    },
    [applyScenePatch]
  );

  const resetSlideshowOptions = useCallback(() => {
    setSlideshowVideoDuration(60);
    setSlideshowIncludeNarration(true);
    setSlideshowIncludeMusic(false);
    setSlideshowVoiceId(SLIDESHOW_DEFAULT_VOICE_ID);
  }, []);

  const resetVideoState = useCallback(() => {
    setVideoUrl(null);
    setVideoStatus(null);
    setVideoError(null);
    setVideoRenderLoading(false);
  }, []);

  const clearActiveProject = useCallback(() => {
    setProjectId(null);
    resetScenes();
    setProgress(0);
    setTotalCost(null);
    resetVideoState();
    resetSlideshowOptions();
    setProjectFailed(false);
    setPreviewScene(null);
    prevUrlCountRef.current = 0;
  }, [resetScenes, resetSlideshowOptions, resetVideoState]);

  const onProjectGone = useCallback(() => {
    try {
      localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
    } catch {
      /* ignore */
    }
    clearActiveProject();
  }, [clearActiveProject]);

  const onProjectFailedMessage = useCallback(
    (message: string) => {
      setError(message);
      setLoading(false);
      setProjectFailed(true);
      try {
        localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
      } catch {
        /* ignore */
      }
    },
    []
  );

  const onCompleteGeneration = useCallback(() => {
    setProgress(100);
    setLoading(false);
  }, []);

  const onLoadError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const onPollError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) router.replace("/login");
  }, [router]);

  const disconnectSocketRef = useRef<() => void>(() => {});

  const onSocketImageUpdate = useCallback(
    (payload: unknown) => {
      const prog = applySocketPayload(payload);
      if (prog != null) setProgress(prog);
    },
    [applySocketPayload]
  );

  const onSocketProjectFailed = useCallback(
    (message: string) => {
      onProjectFailedMessage(message);
      disconnectSocketRef.current();
    },
    [onProjectFailedMessage]
  );

  const { disconnectSocket } = useSceneSocket({
    projectId,
    projectFailed,
    onImageUpdate: onSocketImageUpdate,
    onProjectFailed: onSocketProjectFailed,
  });

  disconnectSocketRef.current = disconnectSocket;

  useProjectDetailSync({
    projectId,
    projectFailed,
    onPatch: applyProjectPatch,
    onCompleteGeneration,
    onProjectGone,
    onProjectFailed: onProjectFailedMessage,
    onLoadError,
    disconnectSocket,
  });

  const shouldPollProject = useMemo(() => {
    if (!projectId || projectFailed) return false;
    if (progress < 100) return true;
    const v = (videoStatus ?? "").toLowerCase();
    return v === "queued" || v === "processing";
  }, [projectId, projectFailed, progress, videoStatus]);

  useProjectPoll({
    projectId,
    projectFailed,
    shouldPoll: shouldPollProject,
    progressRef,
    onPatch: applyProjectPatch,
    onCompleteGeneration,
    onProjectGone,
    onProjectFailed: onProjectFailedMessage,
    onPollError,
    disconnectSocket,
  });

  useEffect(() => {
    if (!projectId || sceneCount <= 0 || progress >= 100 || projectFailed) return;
    if (
      scenes.length >= sceneCount &&
      scenes.every((s) => Boolean(s.imageUrl))
    ) {
      setProgress(100);
    }
  }, [projectId, sceneCount, scenes, progress, projectFailed]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
    } catch {
      /* ignore */
    }
    router.replace("/login");
  }, [router]);

  const handleClearHistory = useCallback(() => {
    try {
      localStorage.removeItem(LAST_IMAGE_PROJECT_KEY);
    } catch {
      /* ignore */
    }
    clearActiveProject();
    setError(null);
    disconnectSocket();
  }, [clearActiveProject, disconnectSocket]);

  const loadProject = useCallback(
    (id: string) => {
      try {
        localStorage.setItem(LAST_IMAGE_PROJECT_KEY, id);
      } catch {
        /* ignore */
      }
      setProjectId(id);
      resetScenes();
      resetVideoState();
      resetSlideshowOptions();
    },
    [resetScenes, resetSlideshowOptions, resetVideoState]
  );

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
        const { data } = await setStudioProjectFavorite({
          id,
          isFavorite: next,
          headers: getStudioAuthHeaders(),
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
    [setHistory]
  );

  const deleteHistoryProject = useCallback(
    async (e: MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm("Are you sure?")) return;

      const wasCurrent = projectId === id;
      try {
        const { res } = await deleteStudioProject({
          id,
          headers: getStudioAuthHeaders(),
        });
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
          clearActiveProject();
          disconnectSocket();
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not delete project. Try again."));
      }
    },
    [clearActiveProject, disconnectSocket, projectId, setHistory]
  );

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
    resetScenes();
    setProgress(0);
    setTotalCost(null);
    resetVideoState();
    resetSlideshowOptions();
    prevUrlCountRef.current = 0;

    try {
      const { data } = await generateStudioImages({
        prompt: trimmed,
        sceneCount,
        headers: getStudioAuthHeaders(),
      });

      const id = extractProjectId(data);
      if (!id) {
        setError("No project id returned. Check your API response.");
        return;
      }

      setProjectId(id);
      setProgress(0);
      seedPlaceholderScenes(sceneCount);
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
  }, [
    disconnectSocket,
    fetchHistory,
    prompt,
    sceneCount,
    resetScenes,
    resetSlideshowOptions,
    resetVideoState,
    seedPlaceholderScenes,
    setHistorySearch,
  ]);

  const canCreateSlideshow = useMemo(() => {
    if (!projectId || projectFailed) return false;
    if (progress < 100) return false;
    if (!scenes.some((s) => Boolean(s.imageUrl))) return false;
    const v = (videoStatus ?? "").toLowerCase();
    if (v === "queued" || v === "processing") return false;
    if (videoUrl) return false;
    if (videoRenderLoading) return false;
    return true;
  }, [
    projectId,
    projectFailed,
    progress,
    scenes,
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
    const voice = slideshowVoiceId.trim() || SLIDESHOW_DEFAULT_VOICE_ID;
    if (voice) body.voiceId = voice;

    setVideoRenderLoading(true);
    try {
      const { res, data } = await renderStudioSlideshow({
        projectId,
        body,
        headers: getStudioAuthHeaders(),
        scenes,
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
    scenes,
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
    storyboardId,
    scenes,
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
    historyLoading,
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
