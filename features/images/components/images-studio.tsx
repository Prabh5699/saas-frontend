"use client";

import { memo, useMemo } from "react";
import { useImagesStudio } from "../hooks/use-images-studio";
import {
  STUDIO_PAGE_CLASS,
  glassPanel,
  studioGlowOverlay,
  studioLayoutRow,
  studioRoot,
} from "../lib/studio-ui-styles";
import { StudioAmbientField } from "@/components/layout/studio-ambient-field";
import { ImageGridPanel } from "./image-grid-panel";
import { ImagePreviewModal } from "./image-preview-modal";
import { ImagePromptForm } from "./image-prompt-form";
import { StudioSidebar } from "./studio-sidebar";

function ImagesStudioShell() {
  const studio = useImagesStudio();

  const sidebarProps = useMemo(
    () => ({
      history: studio.history,
      sortedHistory: studio.sortedHistory,
      historySearch: studio.historySearch,
      setHistorySearch: studio.setHistorySearch,
      historyLoading: studio.historyLoading,
      allHistoryCount: studio.allHistoryCount,
      projectId: studio.projectId,
      loadProject: studio.loadProject,
      handleClearHistory: studio.handleClearHistory,
      handleLogout: studio.handleLogout,
    }),
    [
      studio.history,
      studio.sortedHistory,
      studio.historySearch,
      studio.setHistorySearch,
      studio.historyLoading,
      studio.allHistoryCount,
      studio.projectId,
      studio.loadProject,
      studio.handleClearHistory,
      studio.handleLogout,
    ]
  );

  const promptFormProps = useMemo(
    () => ({
      prompt: studio.prompt,
      setPrompt: studio.setPrompt,
      sceneCount: studio.sceneCount,
      setSceneCount: studio.setSceneCount,
      templates: studio.templates,
      templateKey: studio.templateKey,
      setTemplateKey: studio.setTemplateKey,
      catalogLoading: studio.catalogLoading,
      catalogError: studio.catalogError,
      error: studio.error,
      setError: studio.setError,
      projectId: studio.projectId,
      showLoader: studio.showLoader,
      handleGenerate: studio.handleGenerate,
      handleRetryGeneration: studio.handleRetryGeneration,
    }),
    [
      studio.prompt,
      studio.setPrompt,
      studio.sceneCount,
      studio.setSceneCount,
      studio.templates,
      studio.templateKey,
      studio.setTemplateKey,
      studio.catalogLoading,
      studio.catalogError,
      studio.error,
      studio.setError,
      studio.projectId,
      studio.showLoader,
      studio.handleGenerate,
      studio.handleRetryGeneration,
    ]
  );

  const gridPanelProps = useMemo(
    () => ({
      projectId: studio.projectId,
      progress: studio.progress,
      projectFailed: studio.projectFailed,
      showLoader: studio.showLoader,
      isGeneratingImages: studio.isGeneratingImages,
      videoRenderInProgress: studio.videoRenderInProgress,
      totalCost: studio.totalCost,
      sortedImages: studio.sortedImages,
      scrollAreaRef: studio.scrollAreaRef,
      previewScene: studio.previewScene,
      handleDownloadAll: studio.handleDownloadAll,
      setPreviewScene: studio.setPreviewScene,
      videoUrl: studio.videoUrl,
      videoStatus: studio.videoStatus,
      videoError: studio.videoError,
      videoRenderLoading: studio.videoRenderLoading,
      canCreateSlideshow: studio.canCreateSlideshow,
      missingSceneNumbers: studio.missingSceneNumbers,
      imagesGenerationComplete: studio.imagesGenerationComplete,
      slideshowVideoDuration: studio.slideshowVideoDuration,
      setSlideshowVideoDuration: studio.setSlideshowVideoDuration,
      slideshowIncludeNarration: studio.slideshowIncludeNarration,
      setSlideshowIncludeNarration: studio.setSlideshowIncludeNarration,
      slideshowIncludeMusic: studio.slideshowIncludeMusic,
      setSlideshowIncludeMusic: studio.setSlideshowIncludeMusic,
      slideshowVoiceId: studio.slideshowVoiceId,
      setSlideshowVoiceId: studio.setSlideshowVoiceId,
      skipRenderReadinessCheck: studio.skipRenderReadinessCheck,
      setSkipRenderReadinessCheck: studio.setSkipRenderReadinessCheck,
      handleCreateSlideshowVideo: studio.handleCreateSlideshowVideo,
      studioProjectId: studio.studioProjectId,
      scenes: studio.scenes,
      motionPresets: studio.motionPresets,
      patchingScene: studio.patchingScene,
      markingAllScenesReady: studio.markingAllScenesReady,
      handlePatchScene: studio.handlePatchScene,
      handleMarkAllScenesReady: studio.handleMarkAllScenesReady,
    }),
    [studio]
  );

  const previewModalProps = useMemo(
    () => ({
      previewScene: studio.previewScene,
      previewItem: studio.previewItem,
      sortedImages: studio.sortedImages,
      viewableImages: studio.viewableImages,
      previewIdx: studio.previewIdx,
      closePreview: studio.closePreview,
      showPrev: studio.showPrev,
      showNext: studio.showNext,
      downloadImage: studio.downloadImage,
    }),
    [
      studio.previewScene,
      studio.previewItem,
      studio.sortedImages,
      studio.viewableImages,
      studio.previewIdx,
      studio.closePreview,
      studio.showPrev,
      studio.showNext,
      studio.downloadImage,
    ]
  );

  return (
    <div className={STUDIO_PAGE_CLASS} style={studioRoot}>
      <div style={studioGlowOverlay} aria-hidden />
      <StudioAmbientField starCount={56} meteorCount={0} />
      <div className="studio-orb studio-orb--violet" aria-hidden />
      <div className="studio-orb studio-orb--cyan" aria-hidden />
      <div className="studio-orb studio-orb--rose" aria-hidden />

      <div style={studioLayoutRow}>
        <div className="hidden lg:flex studio-fade-in" style={{ height: "100%" }}>
          <StudioSidebar {...sidebarProps} />
        </div>

        <main
          className="hide-scroll studio-fade-in-delay"
          style={{
            ...glassPanel,
            background:
              "linear-gradient(145deg, rgba(8,12,28,0.94) 0%, rgba(6,10,26,0.9) 100%)",
            flex: 1,
            position: "relative",
            zIndex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 48px 48px",
            minWidth: 0,
            height: "100%",
          }}
        >
          <ImagePromptForm {...promptFormProps} />
        </main>

        <div
          className="hidden lg:flex studio-fade-in"
          style={{ height: "100%", animationDelay: "0.12s" }}
        >
          <ImageGridPanel {...gridPanelProps} />
        </div>
      </div>

      <ImagePreviewModal {...previewModalProps} />
    </div>
  );
}

export const ImagesStudio = memo(ImagesStudioShell);
