import { memo } from "react";

type VideoRenderStatusProps = {
  videoStatus: string | null;
  videoError: string | null;
  videoUrl: string | null;
  videoRenderLoading: boolean;
  hasImages?: boolean;
  projectFailed?: boolean;
  showLoader?: boolean;
};

const pillBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginTop: 10,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 500,
} as const;

function VideoRenderStatusInner({
  videoStatus,
  videoError,
  videoUrl,
  videoRenderLoading,
  hasImages,
  projectFailed,
  showLoader,
}: VideoRenderStatusProps) {
  const s = (videoStatus ?? "").toLowerCase();
  const busy =
    videoRenderLoading || s === "queued" || s === "processing";
  const failed = s === "failed" || Boolean(videoError && !videoUrl);
  const ready = Boolean(videoUrl) || s === "completed";

  if (busy) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          ...pillBase,
          background: "rgba(37,99,235,0.12)",
          border: "1px solid rgba(59,130,246,0.25)",
          color: "#93c5fd",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#60a5fa",
          }}
        />
        <span>Rendering…</span>
      </div>
    );
  }

  if (failed) {
    return (
      <p
        role="alert"
        style={{
          marginTop: 12,
          fontSize: 13,
          color: "rgba(248,113,113,0.9)",
        }}
      >
        {videoError ?? "Render failed"}
      </p>
    );
  }

  if (ready || (hasImages && !projectFailed && !showLoader)) {
    return (
      <div
        style={{
          ...pillBase,
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.2)",
          color: "rgba(134,239,172,0.9)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4ade80",
          }}
        />
        <span>Ready</span>
      </div>
    );
  }

  return null;
}

export const VideoRenderStatus = memo(VideoRenderStatusInner);
