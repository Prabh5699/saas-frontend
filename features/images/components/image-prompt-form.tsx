import { Button } from "@/components/ui/button";
import type { ImagesStudioState } from "../hooks/use-images-studio";
import { ImageIcon } from "./icons";

type ImagePromptFormProps = Pick<
  ImagesStudioState,
  | "prompt"
  | "setPrompt"
  | "sceneCount"
  | "setSceneCount"
  | "setCustomSceneCount"
  | "error"
  | "setError"
  | "projectId"
  | "showLoader"
  | "handleGenerate"
  | "handleRetryGeneration"
>;

export function ImagePromptForm({
  prompt,
  setPrompt,
  sceneCount,
  setSceneCount,
  setCustomSceneCount,
  error,
  setError,
  projectId,
  showLoader,
  handleGenerate,
  handleRetryGeneration,
}: ImagePromptFormProps) {
  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/25 via-transparent to-fuchsia-500/20 opacity-70 blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/55 p-6 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.55)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        <label
          htmlFor="image-prompt"
          className="mb-3 flex items-center justify-between gap-2"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Prompt
          </span>
          <span className="text-xs text-zinc-600">{prompt.length} chars</span>
        </label>
        <textarea
          id="image-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={7}
          placeholder="Example: Neon alley at night, rain on cobblestones, cinematic rim light, shallow depth of field..."
          className="mb-6 w-full resize-none rounded-xl border border-white/[0.09] bg-zinc-900/45 px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
        />

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Scene count
        </p>
        <div className="mb-8 flex flex-wrap items-center gap-2">
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
              {n} scenes
            </button>
          ))}
          <label
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              ![3, 5, 8].includes(sceneCount)
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_-4px_rgb(139_92_246/0.4)]"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
            }`}
            title="Custom scene count (1-20)"
          >
            <span className="text-xs font-medium uppercase tracking-wider">
              Custom
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={sceneCount}
              onChange={(e) => setCustomSceneCount(e.target.value)}
              className="w-14 rounded-md border border-white/10 bg-zinc-950/60 px-2 py-1 text-center text-sm font-semibold text-zinc-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_2px_rgb(139_92_246/0.18)]"
              aria-label="Custom scene count"
            />
          </label>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/[0.12] px-4 py-3 text-sm text-red-100/95"
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
          loading={showLoader}
          loadingLabel={projectId ? "Generating..." : "Starting..."}
        >
          <>
            <ImageIcon className="h-5 w-5 opacity-90" />
            Generate images
          </>
        </Button>

        <p className="mt-4 text-center text-[11px] text-zinc-600">
          More scenes take longer - fewer scenes return faster previews.
        </p>
      </div>
    </div>
  );
}
