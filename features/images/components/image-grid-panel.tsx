"use client";

import { memo, useEffect, useRef, useState } from "react";
import { StudioGenerationLoader } from "./studio-generation-loader";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import { glassPanel, sectionLabel } from "../lib/studio-ui-styles";
import { OutputOptionsModal } from "./output-options-modal";
import { VideoPreviewModal } from "./video-preview-modal";
import { VideoRenderStatus } from "./video-render-status";

type ImageGridPanelProps = Pick<
  ImagesStudioState,
  | "projectId"
  | "progress"
  | "projectFailed"
  | "showLoader"
  | "isGeneratingImages"
  | "videoRenderInProgress"
  | "totalCost"
  | "sortedImages"
  | "scrollAreaRef"
  | "previewScene"
  | "handleDownloadAll"
  | "setPreviewScene"
  | "videoUrl"
  | "videoStatus"
  | "videoError"
  | "videoRenderLoading"
  | "canCreateSlideshow"
  | "missingSceneNumbers"
  | "imagesGenerationComplete"
  | "slideshowVideoDuration"
  | "setSlideshowVideoDuration"
  | "slideshowIncludeNarration"
  | "setSlideshowIncludeNarration"
  | "slideshowIncludeMusic"
  | "setSlideshowIncludeMusic"
  | "slideshowVoiceId"
  | "setSlideshowVoiceId"
  | "skipRenderReadinessCheck"
  | "setSkipRenderReadinessCheck"
  | "handleCreateSlideshowVideo"
  | "studioProjectId"
  | "scenes"
  | "motionPresets"
  | "patchingScene"
  | "markingAllScenesReady"
  | "handlePatchScene"
  | "handleMarkAllScenesReady"
>;

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function truncateCaption(text: string, max = 42) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function storyboardThumbStyle(active: boolean) {
  return {
    position: "relative" as const,
    width: 72,
    height: 48,
    borderRadius: 6,
    overflow: "hidden" as const,
    flexShrink: 0,
    padding: 0,
    cursor: "pointer" as const,
    fontFamily: "inherit",
    border: `1px solid ${active ? "rgba(129,140,248,0.55)" : "rgba(255,255,255,0.08)"}`,
    boxShadow: active ? "0 0 0 2px rgba(99,102,241,0.35)" : "none",
    background: "rgba(255,255,255,0.04)",
  };
}

type PreviewPlayerProps = {
  videoUrl: string | null;
  heroImage: string | null;
  caption: string;
  durationSec: number;
  onExpandVideo: (state: { currentTime: number; playing: boolean }) => void;
  onExpandImage: () => void;
  sortedImages: ImageGridPanelProps["sortedImages"];
  setPreviewScene: (n: number) => void;
};

function PreviewPlayer({
  videoUrl,
  heroImage,
  caption,
  durationSec,
  onExpandVideo,
  onExpandImage,
  sortedImages,
  setPreviewScene,
}: PreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(durationSec);

  useEffect(() => {
    setVideoDuration(durationSec);
  }, [durationSec]);

  const totalDuration = videoUrl ? videoDuration : durationSec;
  const progressPct =
    totalDuration > 0
      ? Math.min(100, (currentTime / totalDuration) * 100)
      : 0;

  const togglePlay = () => {
    const v = videoRef.current;
    if (v) {
      if (v.paused) void v.play();
      else v.pause();
      return;
    }
    if (heroImage) {
      const img = sortedImages.find((i) => i.imageUrl === heroImage);
      if (img) setPreviewScene(img.scene_number);
    }
  };

  const handleExpand = () => {
    if (videoUrl) {
      onExpandVideo({
        currentTime: videoRef.current?.currentTime ?? currentTime,
        playing,
      });
      return;
    }
    onExpandImage();
  };

  return (
    <div style={{ margin: 12, position: "relative" }}>
      <div
        className="studio-preview-frame"
        style={{
          borderRadius: 12,
          overflow: "hidden",
          aspectRatio: "16/9",
          background:
            "linear-gradient(160deg, #050c2a 0%, #0f172a 50%, #1e1b4b 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 0 48px rgba(99,102,241,0.2), 0 0 80px -20px rgba(34,211,238,0.12), 0 24px 64px rgba(0,0,0,0.55)",
          position: "relative",
        }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={() =>
              setCurrentTime(videoRef.current?.currentTime ?? 0)
            }
            onLoadedMetadata={() => {
              const d = videoRef.current?.duration;
              if (d && Number.isFinite(d)) setVideoDuration(d);
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : heroImage ? (
          <img
            src={heroImage}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: 12, color: "rgba(96,120,200,0.35)" }}>
              Preview appears here
            </p>
          </div>
        )}

        {(heroImage || videoUrl) && caption ? (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "32px 14px 12px",
              background:
                "linear-gradient(to top, rgba(6,10,26,0.95) 0%, rgba(15,23,42,0.5) 45%, transparent 100%)",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              pointerEvents: "none",
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 4px 4px",
          gap: 8,
        }}
      >
        <button
          type="button"
          className="studio-icon-btn"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(59,130,246,0.2))",
            border: "1px solid rgba(129,140,248,0.35)",
            color: "#e0e7ff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            flexShrink: 0,
            fontFamily: "inherit",
          }}
        >
          {playing ? "❚❚" : "▶"}
        </button>

        <div
          style={{
            flex: 1,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #6366f1, #38bdf8, #818cf8)",
              borderRadius: 999,
              transition: "width 200ms linear",
              boxShadow: "0 0 12px rgba(99,102,241,0.5)",
            }}
          />
        </div>

        <span
          style={{
            fontSize: 10,
            color: "rgba(96,120,200,0.5)",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtTime(currentTime)} / {fmtTime(totalDuration)}
        </span>

        <button
          type="button"
          className="studio-icon-btn"
          onClick={handleExpand}
          aria-label={videoUrl ? "Expand video" : "Expand preview"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(199,210,254,0.75)",
            cursor: "pointer",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "inherit",
          }}
        >
          ⛶
        </button>
      </div>
    </div>
  );
}

function ImageGridPanelInner({
  projectId,
  progress,
  projectFailed,
  showLoader,
  isGeneratingImages,
  videoRenderInProgress,
  totalCost,
  sortedImages,
  scrollAreaRef,
  previewScene,
  handleDownloadAll,
  setPreviewScene,
  videoUrl,
  videoStatus,
  videoError,
  videoRenderLoading,
  canCreateSlideshow,
  missingSceneNumbers,
  imagesGenerationComplete,
  slideshowVideoDuration,
  setSlideshowVideoDuration,
  slideshowIncludeNarration,
  setSlideshowIncludeNarration,
  slideshowIncludeMusic,
  setSlideshowIncludeMusic,
  slideshowVoiceId,
  setSlideshowVoiceId,
  skipRenderReadinessCheck,
  setSkipRenderReadinessCheck,
  handleCreateSlideshowVideo,
  studioProjectId,
  scenes,
  motionPresets,
  patchingScene,
  markingAllScenesReady,
  handlePatchScene,
  handleMarkAllScenesReady,
}: ImageGridPanelProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [expandedVideoTime, setExpandedVideoTime] = useState(0);
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const completed = sortedImages.filter((i) => Boolean(i.imageUrl)).length;
  const hasImages = completed > 0;
  const focusedScene = previewScene ?? activeScene;
  const heroImage =
    sortedImages.find((i) => i.scene_number === focusedScene)?.imageUrl ??
    sortedImages.find((i) => i.imageUrl)?.imageUrl ??
    null;
  const videoDone =
    (videoStatus ?? "").toLowerCase() === "completed" && Boolean(videoUrl);
  const canRender =
    projectId !== null &&
    hasImages &&
    !projectFailed &&
    canCreateSlideshow &&
    !videoDone;

  const sceneMeta = scenes.find((s) => s.sequence === focusedScene) ?? scenes[0];
  const caption = truncateCaption(
    sceneMeta?.narrationOverride ?? sceneMeta?.prompt ?? ""
  );

  const handleExpandVideo = (state: {
    currentTime: number;
    playing: boolean;
  }) => {
    setExpandedVideoTime(state.currentTime);
    setVideoExpanded(true);
  };

  const handleExpandImage = () => {
    const n =
      focusedScene ??
      sortedImages.find((i) => i.imageUrl)?.scene_number ??
      null;
    if (n != null) setPreviewScene(n);
  };

  return (
    <aside
      className="studio-panel"
      style={{
        ...glassPanel,
        width: 300,
        minWidth: 300,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(96,120,200,0.35)",
          }}
        >
          Preview
        </span>
        {totalCost != null ? (
          <span style={{ fontSize: 11, color: "rgba(96,120,200,0.4)" }}>
            ${totalCost.toFixed(2)}
          </span>
        ) : (
          <span />
        )}
        {hasImages ? (
          <button
            type="button"
            className="studio-btn-ghost"
            onClick={handleDownloadAll}
            style={{
              padding: "5px 11px",
              borderRadius: 8,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(129,140,248,0.35)",
              fontSize: 11,
              color: "#a5b4fc",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ↓ Download
          </button>
        ) : (
          <span />
        )}
      </div>

      <div style={{ position: "relative", flexShrink: 0 }}>
        <PreviewPlayer
          videoUrl={videoUrl}
          heroImage={heroImage}
          caption={caption}
          durationSec={slideshowVideoDuration}
          onExpandVideo={handleExpandVideo}
          onExpandImage={handleExpandImage}
          sortedImages={sortedImages}
          setPreviewScene={setPreviewScene}
        />

        {isGeneratingImages ? (
          <StudioGenerationLoader
            progress={progress}
            status="Generating your scenes"
            substatus="AI is painting each frame"
            sceneCompleted={completed}
            sceneTotal={sortedImages.length || undefined}
            variant="images"
          />
        ) : null}

        {videoRenderInProgress && !videoUrl ? (
          <StudioGenerationLoader
            progress={null}
            status="Rendering your video"
            substatus="This usually takes about a minute"
            variant="video"
          />
        ) : null}
      </div>

      <div style={{ padding: "0 14px", flexShrink: 0 }}>
        <VideoRenderStatus
          videoStatus={videoStatus}
          videoError={videoError}
          videoUrl={videoUrl}
          videoRenderLoading={videoRenderLoading || videoRenderInProgress}
          hasImages={hasImages}
          projectFailed={projectFailed}
          showLoader={showLoader}
        />
      </div>

      <div
        ref={scrollAreaRef}
        className="hide-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {sortedImages.length > 0 ? (
          <>
            <div style={{ ...sectionLabel, padding: "12px 14px 8px" }}>
              Storyboard
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                padding: "0 14px 12px",
                overflow: "hidden",
              }}
            >
              {sortedImages.map((img) => {
                const isActive =
                  focusedScene === img.scene_number ||
                  (!focusedScene &&
                    img.scene_number ===
                      sortedImages.find((s) => s.imageUrl)?.scene_number);
                return (
                  <button
                    key={img.scene_number}
                    type="button"
                    disabled={!img.imageUrl}
                    onClick={() => {
                      if (!img.imageUrl) return;
                      setActiveScene(img.scene_number);
                      setPreviewScene(img.scene_number);
                    }}
                    className={
                      isActive ? "studio-thumb studio-thumb--active" : "studio-thumb"
                    }
                    style={{
                      ...storyboardThumbStyle(isActive),
                      opacity: img.imageUrl ? 1 : 0.35,
                      cursor: img.imageUrl ? "pointer" : "not-allowed",
                    }}
                  >
                    {img.imageUrl ? (
                      <img
                        src={img.imageUrl}
                        alt={`Scene ${img.scene_number}`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      />
                    )}
                    <span
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#fff",
                        background: "rgba(0,0,0,0.65)",
                        borderRadius: 3,
                        padding: "1px 5px",
                        lineHeight: 1.3,
                        minWidth: 14,
                        textAlign: "center",
                      }}
                    >
                      {img.scene_number}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {(canRender || (studioProjectId && hasImages)) && (
          <div
            style={{
              padding: "12px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginTop: "auto",
            }}
          >
            <button
              type="button"
              className="studio-btn-ghost"
              onClick={() => setShowOptions(true)}
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "10px 14px",
                width: "100%",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(199,210,254,0.8)",
                letterSpacing: 0.02,
                fontFamily: "inherit",
              }}
            >
              Output options
            </button>
          </div>
        )}
      </div>

      <VideoPreviewModal
        open={videoExpanded}
        onClose={() => setVideoExpanded(false)}
        videoUrl={videoUrl}
        caption={caption}
        initialTime={expandedVideoTime}
        autoPlay
      />

      <OutputOptionsModal
        open={showOptions}
        onClose={() => setShowOptions(false)}
        canRender={canRender}
        projectId={projectId}
        projectFailed={projectFailed}
        videoDone={videoDone}
        imagesGenerationComplete={imagesGenerationComplete}
        missingSceneNumbers={missingSceneNumbers}
        studioProjectId={studioProjectId}
        hasImages={hasImages}
        scenes={scenes}
        motionPresets={motionPresets}
        patchingScene={patchingScene}
        markingAllScenesReady={markingAllScenesReady}
        handlePatchScene={handlePatchScene}
        handleMarkAllScenesReady={handleMarkAllScenesReady}
        slideshowVideoDuration={slideshowVideoDuration}
        setSlideshowVideoDuration={setSlideshowVideoDuration}
        slideshowIncludeNarration={slideshowIncludeNarration}
        setSlideshowIncludeNarration={setSlideshowIncludeNarration}
        slideshowIncludeMusic={slideshowIncludeMusic}
        setSlideshowIncludeMusic={setSlideshowIncludeMusic}
        slideshowVoiceId={slideshowVoiceId}
        setSlideshowVoiceId={setSlideshowVoiceId}
        skipRenderReadinessCheck={skipRenderReadinessCheck}
        setSkipRenderReadinessCheck={setSkipRenderReadinessCheck}
        videoRenderLoading={videoRenderLoading}
        videoRenderInProgress={videoRenderInProgress}
        onRender={handleCreateSlideshowVideo}
      />
    </aside>
  );
}

export const ImageGridPanel = memo(ImageGridPanelInner);
