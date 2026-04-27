import type { ImagesStudioState } from "../hooks/use-images-studio";

type ImagePreviewModalProps = Pick<
  ImagesStudioState,
  | "previewScene"
  | "previewItem"
  | "sortedImages"
  | "viewableImages"
  | "previewIdx"
  | "closePreview"
  | "showPrev"
  | "showNext"
  | "downloadImage"
>;

export function ImagePreviewModal({
  previewScene,
  previewItem,
  sortedImages,
  viewableImages,
  previewIdx,
  closePreview,
  showPrev,
  showNext,
  downloadImage,
}: ImagePreviewModalProps) {
  if (previewScene === null) return null;

  const fallback =
    previewItem ??
    sortedImages.find((i) => i.scene_number === previewScene) ??
    null;
  if (!fallback || !fallback.imageUrl) return null;

  const total = viewableImages.length;
  const positionLabel =
    previewIdx >= 0 && total > 0
      ? `${previewIdx + 1} / ${total}`
      : `${fallback.scene_number}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Scene ${fallback.scene_number} preview`}
      onClick={closePreview}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-3 top-3 z-10 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm sm:left-4 sm:top-4">
          Scene {fallback.scene_number} · {positionLabel}
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={() =>
              void downloadImage(fallback.imageUrl!, fallback.scene_number)
            }
            className="rounded-lg bg-violet-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_6px_20px_-6px_rgb(139_92_246/0.6)] transition hover:bg-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            Download
          </button>
          <button
            type="button"
            onClick={closePreview}
            className="rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
            aria-label="Close preview"
          >
            x
          </button>
        </div>

        <img
          key={fallback.scene_number}
          src={fallback.imageUrl}
          alt={`Scene ${fallback.scene_number}`}
          className="max-h-[85vh] w-full rounded-xl object-contain"
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:left-4 sm:h-12 sm:w-12"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:right-4 sm:h-12 sm:w-12"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
