"use client";

import { memo, useState } from "react";
import { generateBtn, sectionLabel } from "../lib/studio-ui-styles";
import { DurationPresets } from "./duration-presets";

type VideoRenderControlsProps = {
  slideshowVideoDuration: number;
  setSlideshowVideoDuration: (n: number) => void;
  slideshowIncludeNarration: boolean;
  setSlideshowIncludeNarration: (v: boolean) => void;
  slideshowIncludeMusic: boolean;
  setSlideshowIncludeMusic: (v: boolean) => void;
  slideshowVoiceId: string;
  setSlideshowVoiceId: (v: string) => void;
  skipRenderReadinessCheck: boolean;
  setSkipRenderReadinessCheck: (v: boolean) => void;
  videoRenderLoading: boolean;
  onRender: () => void;
};

const checkRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "rgba(148,163,220,0.5)",
  cursor: "pointer",
} as const;

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

function VideoRenderControlsInner({
  slideshowVideoDuration,
  setSlideshowVideoDuration,
  slideshowIncludeNarration,
  setSlideshowIncludeNarration,
  slideshowIncludeMusic,
  setSlideshowIncludeMusic,
  slideshowVoiceId,
  setSlideshowVoiceId,
  skipRenderReadinessCheck,
  setSkipRenderReadinessCheck,
  videoRenderLoading,
  onRender,
}: VideoRenderControlsProps) {
  const [advanced, setAdvanced] = useState(false);

  return (
    <div style={{ display: "grid", rowGap: 16 }}>
      <div>
        <p style={{ ...sectionLabel, marginBottom: 8 }}>Duration</p>
        <DurationPresets
          value={slideshowVideoDuration}
          onChange={setSlideshowVideoDuration}
        />
      </div>

      <label style={checkRow}>
        <input
          type="checkbox"
          checked={skipRenderReadinessCheck}
          onChange={(e) => setSkipRenderReadinessCheck(e.target.checked)}
        />
        Include all scenes
      </label>

      <button
        type="button"
        onClick={() => void onRender()}
        disabled={videoRenderLoading}
        style={{
          ...generateBtn,
          height: 40,
          fontSize: 13,
          opacity: videoRenderLoading ? 0.5 : 1,
          cursor: videoRenderLoading ? "not-allowed" : "pointer",
        }}
      >
        {videoRenderLoading ? "Starting…" : "Render video"}
      </button>

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: 11,
          color: "rgba(96,120,200,0.4)",
          fontFamily: "inherit",
          justifySelf: "start",
        }}
      >
        {advanced ? "Less" : "Advanced"}
      </button>

      {advanced ? (
        <div
          style={{
            display: "grid",
            rowGap: 8,
            padding: 12,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
          }}
        >
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={slideshowIncludeNarration}
              onChange={(e) => setSlideshowIncludeNarration(e.target.checked)}
            />
            Narration
          </label>
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={slideshowIncludeMusic}
              onChange={(e) => setSlideshowIncludeMusic(e.target.checked)}
            />
            Music
          </label>
          <input
            type="text"
            value={slideshowVoiceId}
            onChange={(e) => setSlideshowVoiceId(e.target.value)}
            placeholder="Voice ID"
            style={{ ...selectInput, fontSize: 13, padding: "8px 10px" }}
          />
        </div>
      ) : null}
    </div>
  );
}

export const VideoRenderControls = memo(VideoRenderControlsInner);
