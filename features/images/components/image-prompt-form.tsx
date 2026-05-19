import { Button } from "@/components/ui/button";
import { memo } from "react";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import { studioPanelInnerClass, studioSectionTitleClass } from "../lib/studio-styles";
import { DurationPresets } from "./duration-presets";
import { ImageIcon } from "./icons";
import { TemplatePicker } from "./template-picker";

type ImagePromptFormProps = Pick<
  ImagesStudioState,
  | "prompt"
  | "setPrompt"
  | "sceneCount"
  | "setSceneCount"
  | "setCustomSceneCount"
  | "templates"
  | "templateKey"
  | "setTemplateKey"
  | "catalogLoading"
  | "catalogError"
  | "error"
  | "setError"
  | "projectId"
  | "showLoader"
  | "slideshowVideoDuration"
  | "setSlideshowVideoDuration"
  | "handleGenerate"
  | "handleRetryGeneration"
>;

function ImagePromptFormInner({
  prompt,
  setPrompt,
  sceneCount,
  setSceneCount,
  setCustomSceneCount,
  templates,
  templateKey,
  setTemplateKey,
  catalogLoading,
  catalogError,
  error,
  setError,
  projectId,
  showLoader,
  slideshowVideoDuration,
  setSlideshowVideoDuration,
  handleGenerate,
  handleRetryGeneration,
}: ImagePromptFormProps) {
  const canGenerate = prompt.trim().length > 0 && !showLoader;

  return (
    <div className="relative h-full">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/15 opacity-80 blur-sm" />
      <div className={`${studioPanelInnerClass} p-6 sm:p-7`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        <p className={`mb-4 ${studioSectionTitleClass}`}>Create</p>

        <label
          htmlFor="image-prompt"
          className="mb-2 flex items-center justify-between gap-2"
        >
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Prompt
          </span>
          <span className="text-xs text-zinc-600">{prompt.length} chars</span>
        </label>
        <textarea
          id="image-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Epic sci-fi trailer: lone pilot against a neon megacity, rim light, anamorphic lens flare, slow push-in on the hero…"
          className="mb-4 min-h-[140px] w-full resize-none rounded-xl border border-white/[0.09] bg-zinc-900/45 px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
        />

        <TemplatePicker
          templates={templates}
          templateKey={templateKey}
          onSelect={setTemplateKey}
          loading={catalogLoading}
          catalogError={catalogError}
        />

        <p className={`mb-2 ${studioSectionTitleClass}`}>Scene count</p>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {[3, 5, 8].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSceneCount(n)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                sceneCount === n
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_-4px_rgb(139_92_246/0.4)]"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
              }`}
            >
              {n}
            </button>
          ))}
          <label
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              ![3, 5, 8].includes(sceneCount)
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                : "border-white/10 bg-white/[0.03] text-zinc-400"
            }`}
          >
            <span className="text-xs font-medium uppercase tracking-wider">
              Custom
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={sceneCount}
              onChange={(e) => setCustomSceneCount(e.target.value)}
              className="w-14 rounded-md border border-white/10 bg-zinc-950/60 px-2 py-1 text-center text-sm font-semibold text-zinc-100 outline-none focus:border-violet-500/50"
              aria-label="Custom scene count"
            />
          </label>
        </div>

        <p className={`mb-2 ${studioSectionTitleClass}`}>Target video length</p>
        <DurationPresets
          value={slideshowVideoDuration}
          onChange={setSlideshowVideoDuration}
          className="mb-6"
        />

        {error ? (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/[0.12] px-4 py-3 text-sm text-red-100/95"
          >
            <p className="leading-relaxed">{error}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs font-medium text-zinc-400 transition hover:text-white"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleRetryGeneration}
                className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
              >
                Try again
              </button>
            </div>
          </div>
        ) : null}

        <Button
          type="button"
          variant="heroPrimary"
          onClick={handleGenerate}
          disabled={!canGenerate}
          loading={showLoader}
          loadingLabel={projectId ? "Generating..." : "Starting..."}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 disabled:opacity-40"
        >
          <>
            <ImageIcon className="h-5 w-5 opacity-90" />
            Generate images
          </>
        </Button>
      </div>
    </div>
  );
}

export const ImagePromptForm = memo(ImagePromptFormInner);
