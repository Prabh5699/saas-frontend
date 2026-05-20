import { memo } from "react";
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

function ImagePreviewModalInner({
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07070e]/90 p-4 backdrop-blur-[20px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Scene ${fallback.scene_number} preview`}
      onClick={closePreview}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-3 top-3 z-10 rounded-md border border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/90 px-2.5 py-1 text-xs font-medium text-[#c4c4d4] backdrop-blur-[20px] sm:left-4 sm:top-4">
          Scene {fallback.scene_number} · {positionLabel}
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={() =>
              void downloadImage(fallback.imageUrl!, fallback.scene_number)
            }
            className="rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#8b5cf6] px-3 py-1.5 text-xs font-semibold text-[#f0f0ff] shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition duration-150 ease-out hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,0.4)]"
          >
            Download
          </button>
          <button
            type="button"
            onClick={closePreview}
            className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/90 px-3 py-1.5 text-sm font-medium text-[#c4c4d4] backdrop-blur-[20px] transition duration-150 ease-out hover:bg-[#16162a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,0.35)]"
            aria-label="Close preview"
          >
            x
          </button>
        </div>

        <img
          key={fallback.scene_number}
          src={fallback.imageUrl}
          alt={`Scene ${fallback.scene_number}`}
          className="max-h-[85vh] w-full rounded-xl object-contain transition-opacity duration-200"
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/90 text-2xl font-light text-[#c4c4d4] backdrop-blur-[20px] transition duration-150 ease-out hover:bg-[#16162a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,0.35)] sm:left-4 sm:h-12 sm:w-12"
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
              className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/90 text-2xl font-light text-[#c4c4d4] backdrop-blur-[20px] transition duration-150 ease-out hover:bg-[#16162a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,0.35)] sm:right-4 sm:h-12 sm:w-12"
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

export const ImagePreviewModal = memo(ImagePreviewModalInner);
