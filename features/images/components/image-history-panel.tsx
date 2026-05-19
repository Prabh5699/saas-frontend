import { memo } from "react";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import {
  historyCreatedLabel,
  historyFirstThumb,
  historyProgressLabel,
  historyProgressPercent,
  historyCanOpenImagePipeline,
  historyImageProjectId,
  historyProjectId,
  historyProjectIsFavorite,
  historyStudioProjectId,
  historyPromptLabel,
  historyTemplateLabel,
  historySceneCountLabel,
  historyVideoStatusLabel,
} from "../utils";

type ImageHistoryPanelProps = Pick<
  ImagesStudioState,
  | "history"
  | "sortedHistory"
  | "historySearch"
  | "setHistorySearch"
  | "historyLoading"
  | "allHistoryCount"
  | "projectId"
  | "loadProject"
  | "templates"
  | "toggleHistoryFavorite"
  | "deleteHistoryProject"
>;

function ImageHistoryPanelInner({
  history,
  sortedHistory,
  historySearch,
  setHistorySearch,
  historyLoading,
  allHistoryCount,
  projectId,
  loadProject,
  templates,
  toggleHistoryFavorite,
  deleteHistoryProject,
}: ImageHistoryPanelProps) {
  const searchActive = historySearch.trim().length > 0;
  const noSearchMatches =
    searchActive && history.length === 0 && allHistoryCount > 0;

  return (
    <aside className="relative lg:sticky lg:top-6 lg:self-start">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/15 opacity-60 blur-sm" />
      <div className="relative flex max-h-[min(60vh,520px)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/55 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.55)] backdrop-blur-xl lg:max-h-[calc(100vh-8rem)]">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
            Your history
          </p>
        </div>
        <div className="border-b border-white/[0.06] px-3 py-2">
          <label htmlFor="history-search" className="sr-only">
            Search history
          </label>
          <input
            id="history-search"
            type="search"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search prompts…"
            autoComplete="off"
            className="w-full rounded-lg border border-white/[0.09] bg-zinc-900/50 px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_2px_rgb(139_92_246/0.12)]"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {historyLoading && allHistoryCount === 0 ? (
            <div
              className="space-y-2 px-1 py-2"
              aria-busy="true"
              aria-label="Loading history"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse gap-3 rounded-xl border border-white/[0.04] bg-zinc-900/40 p-2.5"
                >
                  <div className="aspect-video w-20 shrink-0 rounded-lg bg-zinc-800/80" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-zinc-800/80" />
                    <div className="h-2 w-1/2 rounded bg-zinc-800/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : noSearchMatches ? (
            <p className="px-1 py-6 text-center text-sm text-zinc-500">
              No projects match
            </p>
          ) : allHistoryCount === 0 ? (
            <p className="px-1 py-6 text-center text-sm leading-relaxed text-zinc-500">
              Generate your first images
            </p>
          ) : (
            <div className="space-y-2">
              {sortedHistory.map((proj) => {
                const imageId = historyImageProjectId(proj);
                const canOpen = historyCanOpenImagePipeline(proj);
                const rowKey =
                  imageId ??
                  (typeof proj.studioProjectId === "string"
                    ? proj.studioProjectId
                    : historyProjectId(proj));
                if (!rowKey) return null;
                const studioId = historyStudioProjectId(proj);
                const thumb = historyFirstThumb(proj);
                const active = Boolean(imageId && projectId === imageId);
                const prog = historyProgressLabel(proj);
                const created = historyCreatedLabel(proj);
                const favorite = historyProjectIsFavorite(proj);
                const templateLabel = historyTemplateLabel(proj, templates);
                const sceneLabel = historySceneCountLabel(proj);
                const videoLabel = historyVideoStatusLabel(proj);
                const subtitleParts = [
                  templateLabel,
                  sceneLabel,
                  videoLabel,
                  prog,
                ].filter(Boolean);

                return (
                  <div
                    key={rowKey}
                    role="button"
                    tabIndex={canOpen ? 0 : -1}
                    onClick={() => {
                      if (!canOpen || !imageId) return;
                      loadProject(imageId, studioId, {
                        templateKey: proj.templateKey,
                      });
                    }}
                    onKeyDown={(ev) => {
                      if (!canOpen || !imageId) return;
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        loadProject(imageId, studioId, {
                          templateKey: proj.templateKey,
                        });
                      }
                    }}
                    title={
                      canOpen
                        ? undefined
                        : "No image project linked — generate a new trailer to open scenes"
                    }
                    className={`flex w-full gap-3 rounded-xl border p-2.5 text-left transition ${
                      canOpen ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                    } ${
                      active
                        ? "border border-violet-500/35 border-l-2 border-l-violet-500 bg-violet-500/10 pl-3 ring-1 ring-violet-500/25"
                        : "border border-white/[0.06] bg-zinc-900/80 hover:border-white/10 hover:bg-zinc-800/90"
                    }`}
                  >
                    <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-800/80">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                          {historyProgressPercent(proj) === 100 ? "Ready" : "…"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
                        {historyPromptLabel(proj) || "Untitled project"}
                      </p>
                      <p className="mt-1 text-[11px] leading-snug text-zinc-500">
                        {subtitleParts.length > 0
                          ? subtitleParts.join(" · ")
                          : "—"}
                        {created ? <span> · {created}</span> : null}
                        {!canOpen ? (
                          <span className="text-amber-400/90">
                            {" "}
                            · No image link
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 self-start">
                      <button
                        type="button"
                        onClick={(ev) => {
                          if (!imageId) return;
                          void toggleHistoryFavorite(ev, imageId, favorite);
                        }}
                        disabled={!imageId}
                        className="rounded-md p-1 text-base leading-none text-amber-300/90 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                        aria-label={
                          favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        aria-pressed={favorite}
                      >
                        {favorite ? "⭐" : "☆"}
                      </button>
                      <button
                        type="button"
                        onClick={(ev) => {
                          if (!imageId) return;
                          void deleteHistoryProject(ev, imageId);
                        }}
                        disabled={!imageId}
                        className="rounded-md p-1 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                        aria-label="Delete project"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export const ImageHistoryPanel = memo(ImageHistoryPanelInner);
