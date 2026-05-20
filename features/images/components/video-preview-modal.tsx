"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type VideoPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  videoUrl: string | null;
  caption?: string;
  initialTime?: number;
  autoPlay?: boolean;
};

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
};

const cardMotion = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
};

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VideoPreviewModalInner({
  open,
  onClose,
  videoUrl,
  caption,
  initialTime = 0,
  autoPlay = true,
}: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  useEffect(() => {
    if (!open || !videoUrl) return;
    const v = videoRef.current;
    if (!v) return;

    const start = () => {
      if (initialTime > 0) v.currentTime = initialTime;
      if (autoPlay) void v.play().catch(() => undefined);
    };

    if (v.readyState >= 1) start();
    else v.addEventListener("loadedmetadata", start, { once: true });

    return () => {
      v.pause();
    };
  }, [open, videoUrl, initialTime, autoPlay]);

  if (!mounted || !videoUrl) return null;

  const progressPct =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <motion.button
            type="button"
            aria-label="Close video preview"
            onClick={onClose}
            {...backdropMotion}
            style={{
              position: "absolute",
              inset: 0,
              border: "none",
              background: "rgba(6,10,26,0.88)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              cursor: "pointer",
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Video preview"
            {...cardMotion}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 960,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(148,163,220,0.8)",
                cursor: "pointer",
                fontSize: 16,
                fontFamily: "inherit",
              }}
            >
              ×
            </button>

            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#050c2a",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow:
                  "0 0 60px rgba(37,99,235,0.25), 0 30px 80px rgba(0,0,0,0.7)",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "16/9" }}>
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
                    if (d && Number.isFinite(d)) setDuration(d);
                  }}
                  onClick={togglePlay}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                    background: "#000",
                    cursor: "pointer",
                  }}
                />

                {caption ? (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "32px 16px 12px",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.85))",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.65)",
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
                  gap: 10,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(37,99,235,0.25)",
                    border: "1px solid rgba(59,130,246,0.35)",
                    color: "#93c5fd",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    flexShrink: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {playing ? "❚❚" : "▶"}
                </button>

                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: "100%",
                      background: "#3b82f6",
                      borderRadius: 999,
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(148,163,220,0.6)",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {fmtTime(currentTime)} / {fmtTime(duration)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export const VideoPreviewModal = memo(VideoPreviewModalInner);
