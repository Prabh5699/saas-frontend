import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <PageShell className="relative z-10 flex min-h-screen max-w-5xl flex-col pb-16 pt-8">
        <header className="mb-16 flex items-center justify-between sm:mb-24">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-55 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/35 ring-1 ring-white/15">
                <span className="text-sm font-bold text-white">L</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Lene
              </p>
              <p className="text-sm font-semibold tracking-tight text-white">
                Video
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center text-center lg:justify-center">
          <p className="animate-login-rise mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/95">
            <span
              className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgb(167_139_250/0.9)]"
              aria-hidden
            />
            AI video from your words
          </p>

          <h1 className="animate-login-rise-delay-1 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl sm:leading-[1.05] lg:text-7xl">
            <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Prompt it.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Watch it come alive.
            </span>
          </h1>

          <p className="animate-login-rise-delay-2 mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Type the shot—mood, lighting, motion—and get a rendered clip in your
            studio. Built for creators who want the vibe without the timeline
            headache.
          </p>

          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/login"
              className={cn(
                buttonVariants({
                  variant: "primary",
                  size: "lg",
                  shine: false,
                }),
                "relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgb(139_92_246/0.55)] active:scale-[0.98]"
              )}
            >
              <span className="relative z-10">Start creating</span>
              <span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover/btn:translate-x-full motion-reduce:opacity-0"
                aria-hidden
              />
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg", shine: false }),
                "rounded-2xl border-white/12 bg-white/[0.04] text-zinc-200 backdrop-blur-sm hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
              )}
            >
              Open studio
            </Link>
          </div>

          <div className="mt-20 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                k: "01",
                t: "Describe",
                d: "Natural-language prompts—scene, style, pace.",
              },
              {
                k: "02",
                t: "Generate",
                d: "Your pipeline renders the clip; we show status live.",
              },
              {
                k: "03",
                t: "Preview",
                d: "Playback when it’s ready—right in the dashboard.",
              },
            ].map((step) => (
              <div
                key={step.k}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left backdrop-blur-sm transition hover:border-violet-500/20 hover:bg-white/[0.04]"
              >
                <p className="mb-2 font-mono text-[10px] text-violet-400/90">
                  {step.k}
                </p>
                <p className="font-medium text-zinc-100">{step.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </main>

        <footer className="mt-auto pt-16 text-center text-[11px] text-zinc-600">
          Lene Video · Text to motion ·{" "}
          <span className="text-zinc-500">
            Sign in to connect to your API
          </span>
        </footer>
      </PageShell>
    </div>
  );
}
