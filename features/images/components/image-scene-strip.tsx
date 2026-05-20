"use client";

import type { StudioMotionPreset, StudioScene } from "@/features/studio/types";
import { memo, useMemo } from "react";
import { sectionLabel } from "../lib/studio-ui-styles";

const READINESS = [
  { value: "not_ready", label: "Not ready" },
  { value: "ready", label: "Ready" },
  { value: "blocked", label: "Blocked" },
] as const;

const selectInput = {
  width: "100%",
  padding: "6px 8px",
  fontSize: 11,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  color: "rgba(148,163,220,0.6)",
  outline: "none",
  fontFamily: "inherit",
} as const;

type ImageSceneStripProps = {
  scenes: StudioScene[];
  motionPresets: StudioMotionPreset[];
  studioProjectId: string | null;
  patchingScene: number | null;
  markingAllScenesReady?: boolean;
  embedded?: boolean;
  missingSceneNumbers?: number[];
  onPatchScene: (
    sceneNumber: number,
    patch: { renderReadiness?: string; motionPresetKey?: string | null }
  ) => void;
  onMarkAllReady?: () => void;
};

function presetKey(p: StudioMotionPreset) {
  return p.key ?? p.id;
}

function ImageSceneStripInner({
  scenes,
  motionPresets,
  studioProjectId,
  patchingScene,
  markingAllScenesReady,
  onPatchScene,
  onMarkAllReady,
  missingSceneNumbers = [],
}: ImageSceneStripProps) {
  const withImages = useMemo(
    () => scenes.filter((s) => Boolean(s.imageUrl)),
    [scenes]
  );

  const missingRows = useMemo(() => {
    const known = new Set(scenes.map((s) => s.sequence));
    return missingSceneNumbers
      .filter((n) => !known.has(n) || !scenes.find((s) => s.sequence === n)?.imageUrl)
      .map((n) => {
        const scene = scenes.find((s) => s.sequence === n);
        return scene ?? { id: null, sequence: n, imageUrl: null, status: "failed" as const };
      });
  }, [missingSceneNumbers, scenes]);

  const allReady = withImages.every(
    (s) => (s.renderReadiness ?? "not_ready") === "ready"
  );
  const busy = markingAllScenesReady || patchingScene !== null;

  if (!studioProjectId || (withImages.length === 0 && missingRows.length === 0)) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={sectionLabel}>Scene readiness</span>
        {onMarkAllReady ? (
          <button
            type="button"
            onClick={onMarkAllReady}
            disabled={busy || allReady || withImages.length === 0}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: busy || allReady || withImages.length === 0 ? "not-allowed" : "pointer",
              fontSize: 11,
              color: "rgba(96,120,200,0.4)",
              opacity: busy || allReady || withImages.length === 0 ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            {markingAllScenesReady
              ? "Updating…"
              : allReady
                ? "All ready"
                : "Mark all ready"}
          </button>
        ) : null}
      </div>
      <div
        className="hide-scroll"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          paddingBottom: 4,
          overflow: "hidden",
        }}
      >
        {withImages.map((scene) => (
          <div
            key={scene.sequence}
            style={{ width: 140, flexShrink: 0, display: "grid", rowGap: 4 }}
          >
            <select
              disabled={busy || patchingScene === scene.sequence}
              value={scene.renderReadiness ?? "not_ready"}
              onChange={(e) =>
                onPatchScene(scene.sequence, {
                  renderReadiness: e.target.value,
                })
              }
              style={selectInput}
            >
              {READINESS.map((o) => (
                <option key={o.value} value={o.value}>
                  {scene.sequence} · {o.label}
                </option>
              ))}
            </select>
            {motionPresets.length > 0 ? (
              <select
                disabled={busy || patchingScene === scene.sequence}
                value={scene.motionPresetKey ?? scene.motionPresetId ?? ""}
                onChange={(e) =>
                  onPatchScene(scene.sequence, {
                    motionPresetKey: e.target.value || null,
                  })
                }
                style={selectInput}
              >
                <option value="">Default motion</option>
                {motionPresets.map((p) => (
                  <option key={presetKey(p)} value={presetKey(p)}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ))}

        {missingRows.map((scene) => (
          <div
            key={`missing-${scene.sequence}`}
            style={{ width: 140, flexShrink: 0, display: "grid", rowGap: 4 }}
          >
            <div
              style={{
                ...selectInput,
                color: "rgba(248,113,113,0.85)",
                borderColor: "rgba(248,113,113,0.25)",
                background: "rgba(248,113,113,0.06)",
                padding: "8px",
                lineHeight: 1.3,
              }}
            >
              {scene.sequence} · No image
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ImageSceneStrip = memo(ImageSceneStripInner);
