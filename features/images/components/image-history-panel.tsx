import type { ImagesStudioState } from "../hooks/use-images-studio";
import {
  historyCreatedLabel,
  historyFirstThumb,
  historyProgressLabel,
  historyProgressPercent,
  historyProjectId,
  historyProjectIsFavorite,
  historyPromptLabel,
} from "../utils";

type ImageHistoryPanelProps = Pick<
  ImagesStudioState,
  | "history"
  | "sortedHistory"
  | "historySearch"
  | "setHistorySearch"
  | "projectId"
  | "loadProject"
  | "toggleHistoryFavorite"
  | "deleteHistoryProject"
>;

export function ImageHistoryPanel({
  history,
  sortedHistory,
  historySearch,
  setHistorySearch,
  projectId,
  loadProject,
  toggleHistoryFavorite,
  deleteHistoryProject,
}: ImageHistoryPanelProps) {
  return (
    <aside className="relative lg:sticky lg:top-6 lg:self-start">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/15 opacity-60 blur-sm" />
      <div className="relative flex max-h-[min(60vh,520px)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/55 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.55)] backdrop-blur-xl">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
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
            placeholder="Search..."
            autoComplete="off"
            className="w-full rounded-lg border border-white/[0.09] bg-zinc-900/50 px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_2px_rgb(139_92_246/0.12)]"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {history.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm leading-relaxed text-zinc-500">
              Generate your first images
            </p>
          ) : (
            <div className="space-y-2">
              {sortedHistory.map((proj) => {
                const hid = historyProjectId(proj);
                if (!hid) return null;
                const thumb = historyFirstThumb(proj);
                const active = projectId === hid;
                const prog = historyProgressLabel(proj);
                const created = historyCreatedLabel(proj);
                const favorite = historyProjectIsFavorite(proj);
                return (
                  <div
                    key={hid}
                    role="button"
                    tabIndex={0}
                    onClick={() => loadProject(hid)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        loadProject(hid);
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                      active
                        ? "border-violet-500/35 bg-violet-500/10 ring-1 ring-violet-500/25"
                        : "border-white/[0.06] bg-zinc-900/80 hover:border-white/10 hover:bg-zinc-800/90"
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-800/80">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                          {historyProgressPercent(proj) === 100 ? "Ready" : "..."}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {historyPromptLabel(proj) || "Untitled project"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        {prog}
                        {created ? <span> · {created}</span> : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(ev) =>
                          void toggleHistoryFavorite(ev, hid, favorite)
                        }
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
                        onClick={(ev) => void deleteHistoryProject(ev, hid)}
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
