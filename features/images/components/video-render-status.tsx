import { Badge } from "@/components/ui/badge";
import { memo } from "react";

type VideoRenderStatusProps = {
  videoStatus: string | null;
  videoError: string | null;
  videoUrl: string | null;
  videoRenderLoading: boolean;
};

function statusLabel(raw: string | null): string {
  const s = (raw ?? "").toLowerCase();
  if (s === "queued") return "Queued";
  if (s === "processing") return "Processing";
  if (s === "completed") return "Completed";
  if (s === "failed") return "Failed";
  if (!s) return "Starting";
  return raw ?? "Unknown";
}

function VideoRenderStatusInner({
  videoStatus,
  videoError,
  videoUrl,
  videoRenderLoading,
}: VideoRenderStatusProps) {
  const s = (videoStatus ?? "").toLowerCase();
  const busy =
    videoRenderLoading || s === "queued" || s === "processing";
  const failed = s === "failed" || Boolean(videoError && !videoUrl);
  const done = Boolean(videoUrl) || s === "completed";

  if (!busy && !failed && !done && !videoRenderLoading) return null;

  return (
    <div
      className="mb-3 rounded-xl border border-white/[0.08] bg-zinc-900/50 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        {busy ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400"
            aria-hidden
          />
        ) : null}
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Video render
        </span>
        {failed ? (
          <Badge variant="failed">Failed</Badge>
        ) : done ? (
          <Badge variant="done">Ready</Badge>
        ) : (
          <Badge variant="processing">{statusLabel(videoStatus)}</Badge>
        )}
      </div>

      {busy ? (
        <p className="mt-2 text-sm text-zinc-300">
          {videoRenderLoading
            ? "Starting render on the server…"
            : s === "queued"
              ? "In queue — FFmpeg will begin shortly."
              : "Rendering your cinematic video — this can take a few minutes."}
        </p>
      ) : null}

      {failed && videoError ? (
        <p className="mt-2 text-sm leading-relaxed text-red-300/95" role="alert">
          {videoError}
        </p>
      ) : null}

      {!busy && !failed && done && !videoUrl ? (
        <p className="mt-2 text-sm text-zinc-400">
          Render finished — refresh if the player does not appear.
        </p>
      ) : null}
    </div>
  );
}

export const VideoRenderStatus = memo(VideoRenderStatusInner);
