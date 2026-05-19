import { LAST_PROJECT_STORAGE_KEY } from "@/features/studio/constants";
import {
  deleteStudioProject,
  generateStudioImages,
  renderStudioSlideshow,
  setStudioProjectFavorite,
} from "@/features/studio/api/facade";
import { parseProjectScenesList } from "@/features/studio/adapters/projects";
import { patchProjectScene, listProjectScenes } from "@/features/studio/api/projects";
import { resolveStudioProjectIdForImage } from "@/features/studio/lib/resolve-studio-project";
import { mergeStudioScenes } from "@/features/studio/adapters/legacy-images";
import { FALLBACK_STUDIO_TEMPLATES } from "../lib/fallback-templates";
import {
  DEFAULT_VIDEO_DURATION_SECONDS,
  STUDIO_TEMPLATE_STORAGE_KEY,
} from "../constants";
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
import type { StudioScene } from "@/features/studio/types";
import {
  downloadImage,
  extractProjectId,
  historyImageProjectId,
  historyProjectId,
  historyStudioProjectId,
} from "../utils";

export const LAST_IMAGE_PROJECT_KEY = LAST_PROJECT_STORAGE_KEY;

export function useImagesStudio() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [sceneCount, setSceneCount] = useState(5);
  const [loading, setLoading] = useState(false);
  /** Legacy `image_projects` id — poll, render, WebSocket. */
  const [projectId, setProjectId] = useState<string | null>(null);
  /** Studio `projects.id` — PATCH scene metadata (from list `legacyImageProjectId` link). */
  const [studioProjectId, setStudioProjectId] = useState<string | null>(null);
  const [templateKey, setTemplateKeyState] = useState(() => {
    if (typeof window === "undefined") return "cinematic_trailer";
    return (
      localStorage.getItem(STUDIO_TEMPLATE_STORAGE_KEY) ?? "cinematic_trailer"
    );
  });
  const [skipRenderReadinessCheck, setSkipRenderReadinessCheck] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [projectFailed, setProjectFailed] = useState(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoRenderLoading, setVideoRenderLoading] = useState(false);
  const [slideshowVideoDuration, setSlideshowVideoDuration] = useState(
    DEFAULT_VIDEO_DURATION_SECONDS
  );
  const [patchingScene, setPatchingScene] = useState<number | null>(null);
  const [slideshowIncludeNarration, setSlideshowIncludeNarration] = useState(false);
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
    setScenes,
  } = useSceneState();

  const {
    history,
    setHistory,
    historySearch,
    setHistorySearch,
    sortedHistory,
    historyLoading,
    allHistoryCount,
    fetchHistory,
  } = useProjectHistory();

  const {
    templates: catalogTemplates,
    motionPresets,
    catalogLoading,
    catalogError,
  } = useStudioCatalog(true);

  const templates = useMemo(() => {
    return catalogTemplates.length > 0
      ? catalogTemplates
      : FALLBACK_STUDIO_TEMPLATES;
  }, [catalogTemplates]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.key === templateKey) ?? templates[0],
    [templates, templateKey]
  );

  const applyTemplateDefaults = useCallback(
    (t: (typeof templates)[0]) => {
      if (t.defaultSceneCount != null && t.defaultSceneCount > 0) {
        setSceneCount(Math.min(20, Math.max(1, t.defaultSceneCount)));
      }
      if (t.defaultDurationSec != null && t.defaultDurationSec > 0) {
        setSlideshowVideoDuration(
          Math.min(86400, Math.max(1, t.defaultDurationSec))
        );
      }
    },
    []
  );

  const setTemplateKey = useCallback(
    (key: string) => {
      setTemplateKeyState(key);
      try {
        localStorage.setItem(STUDIO_TEMPLATE_STORAGE_KEY, key);
      } catch {
        /* ignore */
      }
      const t = templates.find((x) => x.key === key);
      if (t) applyTemplateDefaults(t);
    },
    [templates, applyTemplateDefaults]
  );

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
    setSlideshowVideoDuration(DEFAULT_VIDEO_DURATION_SECONDS);
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
    setStudioProjectId(null);
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
    (
      imageId: string,
      studioId?: string | null,
      meta?: { templateKey?: string }
    ) => {
      try {
        localStorage.setItem(LAST_IMAGE_PROJECT_KEY, imageId);
      } catch {
        /* ignore */
      }
      setProjectId(imageId);
      setStudioProjectId(studioId ?? null);
      if (meta?.templateKey) setTemplateKeyState(meta.templateKey);
      setProjectFailed(false);
      setError(null);
      resetScenes();
      resetVideoState();
      resetSlideshowOptions();
    },
    [resetScenes, resetSlideshowOptions, resetVideoState]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LAST_IMAGE_PROJECT_KEY);
    if (!saved || projectId) return;
    loadProject(saved);
  }, [loadProject, projectId]);

  useEffect(() => {
    if (!studioProjectId) return;
    let cancelled = false;
    void (async () => {
      const { res, data } = await listProjectScenes({
        projectId: studioProjectId,
        headers: getStudioAuthHeaders(),
      });
      if (cancelled || !res.ok || data == null) return;
      const studioScenes = parseProjectScenesList(data);
      if (studioScenes.length === 0) return;
      setScenes((prev) => mergeStudioScenes(prev, studioScenes));
    })();
    return () => {
      cancelled = true;
    };
  }, [studioProjectId, setScenes]);

  const handlePatchScene = useCallback(
    async (
      sceneNumber: number,
      patch: { renderReadiness?: string; motionPresetKey?: string | null }
    ) => {
      if (!studioProjectId) {
        setError("Studio project not linked — cannot edit scene metadata.");
        return;
      }
      setPatchingScene(sceneNumber);
      setError(null);
      try {
        const body: Record<string, unknown> = { ...patch };
        if (patch.renderReadiness === "ready") {
          body.approvalStatus = "approved";
        }
        const { res } = await patchProjectScene({
          projectId: studioProjectId,
          sceneNumber,
          patch: body,
          headers: getStudioAuthHeaders(),
        });
        if (!res.ok) {
          setError("Could not update scene. Try again.");
          return;
        }
        setScenes((prev) =>
          prev.map((s) =>
            s.sequence === sceneNumber
              ? {
                  ...s,
                  ...(patch.renderReadiness != null
                    ? {
                        renderReadiness:
                          patch.renderReadiness as StudioScene["renderReadiness"],
                      }
                    : {}),
                  ...(patch.motionPresetKey !== undefined
                    ? { motionPresetKey: patch.motionPresetKey }
                    : {}),
                }
              : s
          )
        );
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not update scene."));
      } finally {
        setPatchingScene(null);
      }
    },
    [studioProjectId, setScenes]
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
          imageProjectId: id,
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
          imageProjectId: id,
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
    if (!templateKey) {
      setError("Pick a style template before generating.");
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
        templateKey,
        headers: getStudioAuthHeaders(),
      });

      const id = extractProjectId(data);
      if (!id) {
        setError("No project id returned. Check your API response.");
        return;
      }

      setProjectId(id);
      setStudioProjectId(null);
      setProgress(0);
      seedPlaceholderScenes(sceneCount);
      try {
        localStorage.setItem(LAST_IMAGE_PROJECT_KEY, id);
      } catch {
        /* ignore */
      }
      setHistorySearch("");
      await fetchHistory();
      const token = localStorage.getItem("access_token");
      if (token) {
        const studioId = await resolveStudioProjectIdForImage({
          imageProjectId: id,
          token,
        });
        if (studioId) setStudioProjectId(studioId);
      }
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
    templateKey,
    resetScenes,
    resetSlideshowOptions,
    resetVideoState,
    seedPlaceholderScenes,
    setHistorySearch,
  ]);

  const canCreateSlideshow = useMemo(() => {
    if (!projectId || projectFailed) return false;
    if (!scenes.some((s) => Boolean(s.imageUrl))) return false;
    const v = (videoStatus ?? "").toLowerCase();
    if (v === "queued" || v === "processing") return false;
    if (videoUrl) return false;
    if (videoRenderLoading) return false;
    return true;
  }, [
    projectId,
    projectFailed,
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
      skipRenderReadinessCheck,
    };
    const voice = slideshowVoiceId.trim() || SLIDESHOW_DEFAULT_VOICE_ID;
    if (voice) body.voiceId = voice;

    setVideoRenderLoading(true);
    try {
      const { res, data } = await renderStudioSlideshow({
        imageProjectId: projectId,
        studioProjectId,
        body,
        headers: getStudioAuthHeaders(),
        scenes,
        patchScenesBeforeRender: !skipRenderReadinessCheck,
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
    studioProjectId,
    slideshowVideoDuration,
    slideshowIncludeNarration,
    slideshowIncludeMusic,
    slideshowVoiceId,
    skipRenderReadinessCheck,
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
    studioProjectId,
    templates,
    motionPresets,
    selectedTemplate,
    templateKey,
    setTemplateKey,
    catalogLoading,
    catalogError,
    skipRenderReadinessCheck,
    setSkipRenderReadinessCheck,
    patchingScene,
    handlePatchScene,
    storyboardId,
    scenes,
    slideshowVideoDuration,
    setSlideshowVideoDuration,
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
    allHistoryCount,
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
