"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { StudioMotionPreset, StudioScene } from "@/features/studio/types";
import { getRenderUnavailableReason } from "../utils";
import { glassPanel } from "../lib/studio-ui-styles";
import { ImageSceneStrip } from "./image-scene-strip";
import { VideoRenderControls } from "./video-render-controls";

type OutputOptionsModalProps = {
  open: boolean;
  onClose: () => void;
  canRender: boolean;
  projectId: string | null;
  projectFailed: boolean;
  videoDone: boolean;
  imagesGenerationComplete: boolean;
  missingSceneNumbers: number[];
  studioProjectId: string | null;
  hasImages: boolean;
  scenes: StudioScene[];
  motionPresets: StudioMotionPreset[];
  patchingScene: number | null;
  markingAllScenesReady: boolean;
  handlePatchScene: (
    sceneNumber: number,
    patch: { renderReadiness?: string; motionPresetKey?: string | null }
  ) => void;
  handleMarkAllScenesReady: () => void;
  slideshowVideoDuration: number;
  setSlideshowVideoDuration: (n: number) => void;
  slideshowIncludeNarration: boolean;
  setSlideshowIncludeNarration: (v: boolean) => void;
  slideshowIncludeMusic: boolean;
  setSlideshowIncludeMusic: (v: boolean) => void;
  slideshowVoiceId: string;
  setSlideshowVoiceId: (v: string) => void;
  skipRenderReadinessCheck: boolean;
  setSkipRenderReadinessCheck: (v: boolean) => void;
  videoRenderLoading: boolean;
  videoRenderInProgress: boolean;
  onRender: () => void;
};

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
};

const cardMotion = {
  initial: { opacity: 0, scale: 0.94, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
};

function OutputOptionsModalInner({
  open,
  onClose,
  canRender,
  projectId,
  projectFailed,
  videoDone,
  imagesGenerationComplete,
  missingSceneNumbers,
  studioProjectId,
  hasImages,
  scenes,
  motionPresets,
  patchingScene,
  markingAllScenesReady,
  handlePatchScene,
  handleMarkAllScenesReady,
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
  videoRenderLoading,
  videoRenderInProgress,
  onRender,
}: OutputOptionsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const unavailableReason = getRenderUnavailableReason({
    projectId,
    projectFailed,
    hasImages,
    videoDone,
    videoRenderInProgress,
    imagesGenerationComplete,
    missingSceneNumbers,
  });

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <motion.button
            type="button"
            aria-label="Close output options"
            onClick={onClose}
            {...backdropMotion}
            style={{
              position: "absolute",
              inset: 0,
              border: "none",
              background: "rgba(6,10,26,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              cursor: "pointer",
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="output-options-title"
            {...cardMotion}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...glassPanel,
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 420,
              maxHeight: "min(88vh, 640px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(37,99,235,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  id="output-options-title"
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#e8f0ff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Render video
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "rgba(96,120,200,0.5)",
                  }}
                >
                  Configure output and start your slideshow render
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(148,163,220,0.6)",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div
              className="hide-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px 18px 20px",
                display: "grid",
                rowGap: 20,
              }}
            >
              {canRender ? (
                <>
                  {missingSceneNumbers.length > 0 ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(251,191,36,0.25)",
                        background: "rgba(251,191,36,0.08)",
                        fontSize: 12,
                        color: "rgba(253,224,171,0.9)",
                        lineHeight: 1.5,
                      }}
                    >
                      Scene {missingSceneNumbers.join(", ")}{" "}
                      {missingSceneNumbers.length > 1 ? "are" : "is"} missing
                      images. Use &quot;Include all scenes&quot; below to render
                      with the scenes you have.
                    </div>
                  ) : null}
                  <VideoRenderControls
                    slideshowVideoDuration={slideshowVideoDuration}
                    setSlideshowVideoDuration={setSlideshowVideoDuration}
                    slideshowIncludeNarration={slideshowIncludeNarration}
                    setSlideshowIncludeNarration={
                      setSlideshowIncludeNarration
                    }
                    slideshowIncludeMusic={slideshowIncludeMusic}
                    setSlideshowIncludeMusic={setSlideshowIncludeMusic}
                    slideshowVoiceId={slideshowVoiceId}
                    setSlideshowVoiceId={setSlideshowVoiceId}
                    skipRenderReadinessCheck={skipRenderReadinessCheck}
                    setSkipRenderReadinessCheck={setSkipRenderReadinessCheck}
                    videoRenderLoading={videoRenderLoading}
                    onRender={onRender}
                  />
                </>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "rgba(148,163,220,0.55)",
                    lineHeight: 1.5,
                  }}
                >
                  {unavailableReason ??
                    "Video render is unavailable right now."}
                </p>
              )}

              {studioProjectId && hasImages ? (
                <div
                  style={{
                    paddingTop: canRender ? 4 : 0,
                    borderTop: canRender
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  }}
                >
                  <ImageSceneStrip
                    scenes={scenes}
                    motionPresets={motionPresets}
                    studioProjectId={studioProjectId}
                    patchingScene={patchingScene}
                    markingAllScenesReady={markingAllScenesReady}
                    onPatchScene={handlePatchScene}
                    onMarkAllReady={() => void handleMarkAllScenesReady()}
                    embedded
                    missingSceneNumbers={missingSceneNumbers}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export const OutputOptionsModal = memo(OutputOptionsModalInner);
