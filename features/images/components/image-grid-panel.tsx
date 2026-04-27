import { Badge } from "@/components/ui/badge";
import { ProgressCard } from "@/components/ui/progress-card";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import { ImageIcon } from "./icons";

type ImageGridPanelProps = Pick<
  ImagesStudioState,
  | "projectId"
  | "progress"
  | "projectFailed"
  | "showLoader"
  | "totalCost"
  | "sortedImages"
  | "scrollAreaRef"
  | "handleDownloadAll"
  | "setPreviewScene"
  | "videoUrl"
  | "videoStatus"
  | "videoError"
  | "videoRenderLoading"
  | "canCreateSlideshow"
  | "slideshowVideoDuration"
  | "setSlideshowVideoDuration"
  | "handleCreateSlideshowVideo"
>;

export function ImageGridPanel({
  projectId,
  progress,
  projectFailed,
  showLoader,
  totalCost,
  sortedImages,
  scrollAreaRef,
  handleDownloadAll,
  setPreviewScene,
  videoUrl,
  videoStatus,
  videoError,
  videoRenderLoading,
  canCreateSlideshow,
  slideshowVideoDuration,
  setSlideshowVideoDuration,
  handleCreateSlideshowVideo,
}: ImageGridPanelProps) {
  const hasImages = sortedImages.some((i) => Boolean(i.imageUrl));
  const videoBusy =
    (videoStatus ?? "").toLowerCase() === "queued" ||
    (videoStatus ?? "").toLowerCase() === "processing";

  return (
    <div className="relative flex min-h-[320px] flex-col lg:min-h-[480px] lg:sticky lg:top-6 lg:self-start">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-transparent to-cyan-500/10 opacity-80 blur-[1px]" />
      <div className="relative flex max-h-[calc(100vh-140px)] min-h-[inherit] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/40 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl">
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
            {hasImages ? (
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

        {projectId !== null && progress >= 100 && !projectFailed ? (
          <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
            {videoUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Slideshow video
                </p>
                <video
                  controls
                  className="max-h-[min(50vh,360px)] w-full rounded-lg border border-white/[0.08] bg-black/40"
                  src={videoUrl}
                />
              </div>
            ) : null}

            {videoError && !videoUrl ? (
              <p className="text-sm text-red-400/90" role="alert">
                {videoError}
              </p>
            ) : null}

            {videoBusy && !videoUrl ? (
              <p className="text-sm text-zinc-400">Rendering video…</p>
            ) : null}

            {canCreateSlideshow ? (
              <div className={videoUrl || videoError || videoBusy ? "mt-3" : ""}>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Video length (seconds)
                  <input
                    type="number"
                    min={1}
                    max={86400}
                    value={slideshowVideoDuration}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") return;
                      const n = parseInt(v, 10);
                      if (Number.isNaN(n)) return;
                      setSlideshowVideoDuration(Math.min(86400, Math.max(1, n)));
                    }}
                    className="mt-1.5 block w-full max-w-[180px] rounded-lg border border-white/[0.12] bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30"
                  />
                </label>
                <p className="mb-3 text-[11px] text-zinc-500">1–86,400 seconds (API limit).</p>
                <button
                  type="button"
                  onClick={() => void handleCreateSlideshowVideo()}
                  disabled={videoRenderLoading}
                  className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-100 transition hover:border-violet-500/50 hover:bg-violet-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {videoRenderLoading ? "Starting…" : "Create video from these images"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

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

          {sortedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {sortedImages.map((img) => (
                <div
                  key={img.scene_number}
                  className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/60 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]"
                >
                  <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-sm">
                    Scene {img.scene_number}
                  </div>

                  {img.imageUrl ? (
                    <img
                      src={img.imageUrl}
                      alt={`Scene ${img.scene_number}`}
                      onClick={() => setPreviewScene(img.scene_number)}
                      className="block h-44 w-full cursor-pointer object-cover transition duration-200 hover:brightness-110 sm:h-48 md:h-44 lg:h-48"
                    />
                  ) : (
                    <div className="flex h-44 w-full animate-pulse items-center justify-center bg-zinc-800/60 text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:h-48 md:h-44 lg:h-48">
                      Generating...
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
              <p className="text-sm font-medium text-zinc-300">No images yet</p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
                Add a prompt on the left and hit generate. Scenes will appear
                here as they finish.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
