"use client";

import { memo } from "react";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import {
  glassPanel,
  projectDate,
  projectName,
  recentSectionLabel,
} from "../lib/studio-ui-styles";
import {
  historyCanOpenImagePipeline,
  historyCreatedLabel,
  historyFirstThumb,
  historyImageProjectId,
  historyProjectId,
  historyPromptLabel,
  historyStudioProjectId,
} from "../utils";

type StudioSidebarProps = Pick<
  ImagesStudioState,
  | "history"
  | "sortedHistory"
  | "historySearch"
  | "setHistorySearch"
  | "historyLoading"
  | "allHistoryCount"
  | "projectId"
  | "loadProject"
  | "handleClearHistory"
  | "handleLogout"
>;

const navActiveStyle = {
  background: "rgba(59,130,246,0.08)",
  borderLeft: "2px solid #60a5fa",
  paddingLeft: "10px",
  color: "#93c5fd",
  fontWeight: 500,
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  padding: "7px 12px 7px 10px",
  fontSize: "13px",
  cursor: "pointer",
  width: "100%",
  borderTop: "none",
  borderRight: "none",
  borderBottom: "none",
  textAlign: "left" as const,
  fontFamily: "inherit",
  marginBottom: 2,
  boxShadow: "none",
  outline: "none",
  WebkitAppearance: "none" as const,
  appearance: "none" as const,
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{
        position: "absolute",
        left: 18,
        top: "50%",
        transform: "translateY(-50%)",
        color: "rgba(96,120,200,0.35)",
        width: 13,
        height: 13,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function StudioSidebarInner({
  history,
  sortedHistory,
  historySearch,
  setHistorySearch,
  historyLoading,
  allHistoryCount,
  projectId,
  loadProject,
  handleClearHistory,
  handleLogout,
}: StudioSidebarProps) {
  const noMatches =
    historySearch.trim().length > 0 &&
    history.length === 0 &&
    allHistoryCount > 0;

  return (
    <aside
      className="studio-panel"
      style={{
        ...glassPanel,
        width: 220,
        minWidth: 220,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 14px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            className="studio-logo-mark"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            LENE
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(199,210,254,0.75)",
              marginTop: 3,
              lineHeight: 1.2,
            }}
          >
            Video
          </div>
        </div>

        <button
          type="button"
          className="studio-btn-ghost"
          onClick={handleClearHistory}
          aria-label="Start a new chat"
          title="New chat"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            flexShrink: 0,
            width: 52,
            padding: "8px 6px",
            borderRadius: 10,
            background:
              "linear-gradient(160deg, rgba(99,102,241,0.14), rgba(255,255,255,0.04))",
            border: "1px solid rgba(129,140,248,0.28)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: "rgba(99,102,241,0.25)",
              border: "1px solid rgba(129,140,248,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 500,
              color: "#c7d2fe",
              lineHeight: 1,
            }}
            aria-hidden
          >
            +
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "rgba(199,210,254,0.85)",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            New
            <br />
            chat
          </span>
        </button>
      </div>

      <div style={{ padding: "12px 8px 8px", flexShrink: 0 }}>
        <button type="button" className="studio-nav-link" style={navActiveStyle}>
          Cinematic studio
        </button>
      </div>

      <div style={recentSectionLabel}>Recent</div>

      <div style={{ padding: "0 8px 8px", position: "relative", flexShrink: 0 }}>
        <SearchIcon />
        <input
          type="search"
          value={historySearch}
          onChange={(e) => setHistorySearch(e.target.value)}
          placeholder="Search projects"
          aria-label="Search projects"
          className="studio-search-input"
          style={{
            width: "100%",
            height: 31,
            padding: "0 10px 0 30px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            fontSize: 12,
            color: "rgba(199,210,254,0.75)",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div
        className="hide-scroll"
        style={{
          overflowY: "auto",
          flex: 1,
          padding: "0 4px",
        }}
      >
        {historyLoading && allHistoryCount === 0 ? (
          <div style={{ padding: "0 4px", display: "grid", rowGap: 4 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 42,
                  borderRadius: 7,
                  background: "rgba(255,255,255,0.03)",
                }}
              />
            ))}
          </div>
        ) : noMatches ? (
          <p
            style={{
              padding: "12px 16px",
              fontSize: 12,
              color: "rgba(96,120,200,0.4)",
            }}
          >
            No matches
          </p>
        ) : allHistoryCount === 0 ? (
          <p
            style={{
              padding: "12px 16px",
              fontSize: 12,
              color: "rgba(96,120,200,0.4)",
            }}
          >
            No projects yet
          </p>
        ) : (
          sortedHistory.slice(0, 24).map((proj) => {
            const imageId = historyImageProjectId(proj);
            const canOpen = historyCanOpenImagePipeline(proj);
            const rowKey =
              imageId ??
              (typeof proj.studioProjectId === "string"
                ? proj.studioProjectId
                : historyProjectId(proj));
            if (!rowKey) return null;
            const active = Boolean(imageId && projectId === imageId);
            const label = historyPromptLabel(proj) || "Untitled";
            const created = historyCreatedLabel(proj);
            const thumb = historyFirstThumb(proj);

            return (
              <button
                key={rowKey}
                type="button"
                disabled={!canOpen}
                onClick={() => {
                  if (!canOpen || !imageId) return;
                  loadProject(imageId, historyStudioProjectId(proj), {
                    templateKey: proj.templateKey,
                  });
                }}
                className={
                  active
                    ? "studio-history-row studio-history-row--active"
                    : "studio-history-row"
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: active ? undefined : "transparent",
                  border: "none",
                  cursor: canOpen ? "pointer" : "not-allowed",
                  opacity: canOpen ? 1 : 0.4,
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.04)",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : null}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={projectName}>{label}</div>
                  {created ? <div style={projectDate}>{created}</div> : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div
        style={{
          padding: "10px 12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          type="button"
          className="studio-btn-ghost"
          onClick={handleLogout}
          style={{
            flex: 1,
            fontSize: 11,
            color: "rgba(199,210,254,0.8)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "8px 10px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Log out
        </button>
        <div
          className="studio-icon-btn"
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
            border: "1px solid rgba(129,140,248,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#c7d2fe",
            cursor: "default",
          }}
          aria-hidden
        >
          U
        </div>
      </div>
    </aside>
  );
}

export const StudioSidebar = memo(StudioSidebarInner);
