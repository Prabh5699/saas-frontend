"use client";

import { useVideoDashboard } from "@/features/video/hooks/use-video-dashboard";
import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressCard } from "@/components/ui/progress-card";
import Link from "next/link";

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18M17 3v18M3 9.5h4M17 9.5h4M3 14.5h4M17 14.5h4" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11 4c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm7.5 15.5-2.39-2.39c-.5-.5-1.31-.5-1.81 0L14 18.09l-1.09-1.09c-.5-.5-1.31-.5-1.81 0l-2.39 2.39c-.5.5-.5 1.31 0 1.81l2.39 2.39c.5.5 1.31.5 1.81 0L14 21.91l1.09 1.09c.5.5 1.31.5 1.81 0l2.39-2.39c.5-.5.5-1.31 0-1.81zM3 21h6v-2H3v2z" />
    </svg>
  );
}

export default function Dashboard() {
  const {
    prompt,
    setPrompt,
    duration,
    setDuration,
    error,
    videoUrl,
    pendingJobId,
    statusHint,
    showLoader,
    handleLogout,
    handleGenerate,
  } = useVideoDashboard();

  return (
    <div className="font-sans relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <PageShell className="relative z-10 !py-6 pb-16 sm:!py-8">
        <header className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-50 blur-md" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/25 ring-1 ring-white/15">
                <span className="text-base font-bold text-white">L</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Lene
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Video
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/images"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            >
              Image Studio
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-violet-300/90">
            <WandIcon className="h-3.5 w-3.5" />
            Text → video
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Describe it.
            </span>{" "}
            <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
              We’ll render it.
            </span>
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
            Write a clear prompt—subject, mood, lighting, camera move—and
            generate a polished clip powered by your backend pipeline.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* Composer */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/25 via-transparent to-fuchsia-500/20 opacity-70 blur-sm" />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/55 p-6 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.55)] backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

              <label
                htmlFor="prompt"
                className="mb-3 flex items-center justify-between gap-2"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Prompt
                </span>
                <span className="text-xs text-zinc-600">
                  {prompt.length} chars
                </span>
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                placeholder="Example: Slow drone shot over neon city at rain, reflections on wet streets, cinematic 35mm, shallow depth of field…"
                className="mb-6 w-full resize-none rounded-xl border border-white/[0.09] bg-zinc-900/45 px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
              />

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Duration
              </p>
              <div className="mb-8 flex flex-wrap gap-2">
                {[30, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDuration(sec)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      duration === sec
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_-4px_rgb(139_92_246/0.4)]"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-500/30 bg-red-500/[0.12] px-4 py-3 text-sm text-red-100/95"
                >
                  {error}
                </div>
              ) : null}

              <Button
                type="button"
                variant="heroPrimary"
                onClick={handleGenerate}
                loading={showLoader}
                loadingLabel={pendingJobId ? "Rendering…" : "Starting…"}
              >
                <>
                  <FilmIcon className="h-5 w-5 opacity-90" />
                  Generate video
                </>
              </Button>

              <p className="mt-4 text-center text-[11px] text-zinc-600">
                Longer clips need more compute—pick a shorter duration for faster
                previews.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="relative flex min-h-[320px] flex-col lg:min-h-[480px]">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-transparent to-cyan-500/10 opacity-80 blur-[1px]" />
            <div className="relative flex min-h-[inherit] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/40 shadow-[0_24px_80px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Preview
                  </span>
                  {videoUrl ? (
                    <Badge variant="done">Ready</Badge>
                  ) : showLoader ? (
                    <Badge variant="processing">Processing</Badge>
                  ) : null}
                </div>
                {statusHint ? (
                  <span className="max-w-[55%] truncate text-right text-xs text-violet-300/90">
                    {statusHint}
                  </span>
                ) : null}
              </div>

              <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
                {videoUrl ? (
                  <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-2xl ring-1 ring-white/5">
                    <div className="aspect-video w-full">
                      <video
                        key={videoUrl}
                        className="h-full w-full object-contain"
                        controls
                        playsInline
                        preload="metadata"
                        src={videoUrl}
                      />
                    </div>
                  </div>
                ) : showLoader ? (
                  <div className="flex w-full flex-col items-center gap-6 px-4">
                    <div className="relative h-20 w-20">
                      <div
                        className="absolute inset-0 rounded-full border-2 border-violet-500/30"
                        style={{ animation: "pulse-ring 2.5s ease-in-out infinite" }}
                      />
                      <div className="absolute inset-2 rounded-full border border-fuchsia-500/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FilmIcon className="h-9 w-9 text-violet-400/80" />
                      </div>
                    </div>
                    <ProgressCard
                      progress={null}
                      status={
                        pendingJobId
                          ? "Your video is in the queue"
                          : "Starting the render"
                      }
                      substatus={
                        pendingJobId
                          ? "We’ll swap in the player when the file is ready."
                          : "Hang tight—warming up the pipeline."
                      }
                      className="border-white/[0.08] bg-zinc-950/40 text-left shadow-none"
                    />
                  </div>
                ) : (
                  <div className="flex max-w-sm flex-col items-center text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-zinc-600">
                      <FilmIcon className="h-11 w-11" />
                    </div>
                    <p className="text-sm font-medium text-zinc-300">
                      No video yet
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      Add a prompt on the left and hit generate. Your finished
                      clip will appear here with playback controls.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
