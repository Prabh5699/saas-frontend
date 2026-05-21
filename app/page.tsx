import { LenePageShell } from "@/components/layout/lene-page-shell";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <LenePageShell>
      <PageShell className="flex h-full min-h-0 max-w-5xl flex-col overflow-y-auto py-0 pb-6 pt-5 sm:pt-6 lg:overflow-hidden lg:pb-5">
        <header className="mb-4 flex shrink-0 items-center justify-between sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 opacity-55 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-600/35 ring-1 ring-white/15">
                <span className="text-sm font-bold text-white">L</span>
              </div>
            </div>
            <div>
              <p className="studio-logo-mark text-[10px] font-bold uppercase tracking-[0.22em]">
                Lene
              </p>
              <p className="text-sm font-semibold tracking-tight text-[#e8eeff]">
                Video
              </p>
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.14em] text-zinc-500">
                Prompt-to-Video Studio
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="studio-btn-ghost rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm"
          >
            Sign in
          </Link>
        </header>

        <main className="flex shrink-0 flex-col items-center text-center pt-[clamp(1.25rem,6vh,3.5rem)] lg:pt-[clamp(1.75rem,8vh,4rem)]">
          <p className="studio-fade-in mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200/95">
            <span
              className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgb(34_211_238/0.8)]"
              aria-hidden
            />
            Cinematic prompt-to-video
          </p>

          <h1 className="studio-fade-in-delay max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-[2.75rem] sm:leading-[1.06] lg:text-[4.25rem] lg:leading-[1.04] xl:text-[5.25rem]">
            <span className="studio-gradient-title">Prompt it.</span>
            <br />
            <span className="studio-gradient-accent">Scene by scene.</span>
          </h1>

          <p className="studio-fade-in-delay mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-[1.0625rem]">
            Lene Video turns a text prompt into a cinematic short—choose a
            template, generate scene images, preview your storyboard, and render
            up to 90 seconds of video in Image Studio.
          </p>

          <p className="studio-fade-in-delay mt-3 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 sm:text-xs">
            Prompt
            <span className="mx-2.5 text-violet-500/35" aria-hidden>
              ·
            </span>
            Template
            <span className="mx-2.5 text-violet-500/35" aria-hidden>
              ·
            </span>
            Scenes
            <span className="mx-2.5 text-violet-500/35" aria-hidden>
              ·
            </span>
            Render
          </p>

          <div className="studio-fade-in-delay mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href="/login"
              className={cn(
                buttonVariants({
                  variant: "primary",
                  size: "md",
                  shine: false,
                }),
                "studio-btn-primary relative overflow-hidden rounded-2xl px-7 py-3 text-sm shadow-[0_20px_50px_-12px_rgb(99_102_241/0.55)] active:scale-[0.98] sm:text-base"
              )}
            >
              <span className="relative z-10">Start creating</span>
            </Link>
            <Link
              href="/images"
              className={cn(
                buttonVariants({ variant: "outline", size: "md", shine: false }),
                "studio-btn-ghost rounded-2xl border-white/12 bg-white/[0.04] px-7 py-3 text-sm text-zinc-200 backdrop-blur-sm sm:text-base"
              )}
            >
              Open studio
            </Link>
          </div>

          <div className="studio-fade-in-delay mt-12 grid w-full max-w-3xl gap-3 sm:grid-cols-3 lg:mt-10">
            {[
              {
                k: "01",
                t: "Describe",
                d: "Write your vision in plain language—setting, mood, lighting, and motion.",
              },
              {
                k: "02",
                t: "Generate",
                d: "Pick a cinematic template and scene count. AI builds each frame with live progress.",
              },
              {
                k: "03",
                t: "Render",
                d: "Review the storyboard, then export a cinematic video up to 90 seconds.",
              },
            ].map((step) => (
              <div
                key={step.k}
                className="studio-panel rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left backdrop-blur-sm sm:p-5"
              >
                <p className="mb-1.5 font-mono text-[10px] text-indigo-400/90">
                  {step.k}
                </p>
                <p className="text-sm font-medium text-zinc-100 sm:text-base">
                  {step.t}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </main>

        <footer className="mt-6 shrink-0 pt-4 text-center text-[11px] text-zinc-600 lg:mt-auto lg:pt-2">
          Lene Video · Prompt to cinematic video ·{" "}
          <span className="text-zinc-500">Sign in to open Image Studio</span>
        </footer>
      </PageShell>
    </LenePageShell>
  );
}
