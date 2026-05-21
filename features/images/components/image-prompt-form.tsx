"use client";

import { memo, useState } from "react";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import { MAX_SCENE_COUNT, MIN_SCENE_COUNT } from "../constants";
import {
  heading,
  promptBox,
  promptTextarea,
  sectionLabel,
  subtext,
} from "../lib/studio-ui-styles";
import { TemplatePicker } from "./template-picker";

type ImagePromptFormProps = Pick<
  ImagesStudioState,
  | "prompt"
  | "setPrompt"
  | "sceneCount"
  | "setSceneCount"
  | "templates"
  | "templateKey"
  | "setTemplateKey"
  | "catalogLoading"
  | "catalogError"
  | "error"
  | "setError"
  | "projectId"
  | "showLoader"
  | "handleGenerate"
  | "handleRetryGeneration"
>;

const PRESETS = [3, 5, 8] as const;

const sceneBtnStyle = (active: boolean) => ({
  width: 44,
  height: 34,
  borderRadius: 8,
  background: active ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.04)",
  border: active
    ? "1px solid rgba(59,130,246,0.4)"
    : "1px solid rgba(255,255,255,0.07)",
  fontSize: 13,
  color: active ? "#93c5fd" : "rgba(148,163,220,0.5)",
  cursor: "pointer",
  fontFamily: "inherit",
});

function ImagePromptFormInner({
  prompt,
  setPrompt,
  sceneCount,
  setSceneCount,
  templates,
  templateKey,
  setTemplateKey,
  catalogLoading,
  catalogError,
  error,
  setError,
  projectId,
  showLoader,
  handleGenerate,
  handleRetryGeneration,
}: ImagePromptFormProps) {
  const canGenerate = prompt.trim().length > 0 && !showLoader;
  const isPreset = (PRESETS as readonly number[]).includes(sceneCount);
  const isCustomActive = !isPreset;
  const [customDraft, setCustomDraft] = useState(
    () => (isPreset ? "" : String(sceneCount))
  );

  const commitCustom = (raw: string) => {
    if (raw.trim() === "") return;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const v = Math.max(MIN_SCENE_COUNT, Math.min(MAX_SCENE_COUNT, n));
    setCustomDraft(String(v));
    setSceneCount(v);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 560,
        position: "relative",
        zIndex: 2,
      }}
    >
      <h1 className="studio-gradient-title" style={heading}>
        Create your{" "}
        <span className="studio-gradient-accent">cinematic</span> story
      </h1>
      <p style={subtext}>
        Describe the vision. Pick a style. Generate scenes in one flow.
      </p>

      <div
        className="studio-prompt-box"
        style={{ ...promptBox, marginBottom: 14 }}
      >
        <label htmlFor="image-prompt" className="sr-only">
          Prompt
        </label>
        <textarea
          id="image-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A lone astronaut walks through a neon-lit megacity at dusk, anamorphic lens flare, slow push-in…"
          style={{ ...promptTextarea, minHeight: 100 }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 12,
            right: 16,
            fontSize: 10,
            color: "rgba(96,120,200,0.3)",
            pointerEvents: "none",
          }}
        >
          {prompt.length}
        </span>
      </div>

      <TemplatePicker
        templates={templates}
        templateKey={templateKey}
        onSelect={setTemplateKey}
        loading={catalogLoading}
        catalogError={catalogError}
      />

      <div style={{ ...sectionLabel, margin: "12px 0 8px" }}>Scenes</div>
      <div
        className="studio-scenes-block"
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(6, 10, 26, 0.28)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "relative",
        }}
      >
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setSceneCount(n);
              setCustomDraft("");
            }}
            className="studio-scene-pill"
            style={sceneBtnStyle(sceneCount === n)}
          >
            {n}
          </button>
        ))}
        <input
          type="text"
          inputMode="numeric"
          className="studio-scene-pill"
          value={customDraft}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            setCustomDraft(raw);
            if (raw === "") return;
            const n = parseInt(raw, 10);
            if (!Number.isNaN(n)) {
              setSceneCount(
                Math.max(MIN_SCENE_COUNT, Math.min(MAX_SCENE_COUNT, n))
              );
            }
          }}
          onBlur={() => commitCustom(customDraft)}
          aria-label="Custom scene count"
          placeholder="Custom"
          style={{
            height: 34,
            padding: "0 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: isCustomActive
              ? "1px solid rgba(59,130,246,0.4)"
              : "1px solid rgba(255,255,255,0.07)",
            fontSize: 12,
            color: isCustomActive ? "#93c5fd" : "rgba(148,163,220,0.5)",
            fontFamily: "inherit",
            outline: "none",
            cursor: "pointer",
            minWidth: 64,
            boxSizing: "border-box",
            WebkitAppearance: "none",
            appearance: "none",
            colorScheme: "dark",
          }}
        />
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.06)",
            fontSize: 13,
            color: "rgba(248,113,113,0.9)",
          }}
        >
          {error}
          <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 12 }}>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "rgba(148,163,220,0.5)",
              }}
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleRetryGeneration}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#93c5fd",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="studio-btn-primary"
        onClick={handleGenerate}
        disabled={!canGenerate}
        aria-busy={showLoader}
        style={{
          width: "100%",
          height: 50,
          borderRadius: 12,
          border: "none",
          background: showLoader
            ? "linear-gradient(135deg, #312e81 0%, #3730a3 50%, #1e40af 100%)"
            : "linear-gradient(135deg, #4338ca 0%, #4f46e5 28%, #2563eb 58%, #0ea5e9 100%)",
          boxShadow: showLoader
            ? "0 0 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 0 32px rgba(99,102,241,0.45), 0 1px 0 rgba(255,255,255,0.12) inset",
          color: "white",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.03em",
          cursor: canGenerate ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          marginTop: 16,
          marginBottom: 8,
          opacity: canGenerate || showLoader ? 1 : 0.45,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {showLoader ? (
          <span
            className="studio-gen-ring-spin"
            aria-hidden
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.25)",
              borderTopColor: "#fff",
              flexShrink: 0,
            }}
          />
        ) : null}
        {showLoader
          ? projectId
            ? "Generating scenes…"
            : "Starting…"
          : "Generate scenes"}
      </button>
    </div>
  );
}

export const ImagePromptForm = memo(ImagePromptFormInner);
