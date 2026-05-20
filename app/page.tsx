import { LenePageShell } from "@/components/layout/lene-page-shell";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <LenePageShell>
      <PageShell className="flex min-h-screen max-w-5xl flex-col pb-16 pt-8">
        <header className="mb-16 flex items-center justify-between sm:mb-24">
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
            </div>
          </div>
          <Link
            href="/login"
            className="studio-btn-ghost rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center text-center lg:justify-center">
          <p className="studio-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200/95">
            <span
              className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgb(34_211_238/0.8)]"
              aria-hidden
            />
            Cinematic AI studio
          </p>

          <h1 className="studio-fade-in-delay max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl sm:leading-[1.05] lg:text-7xl">
            <span className="studio-gradient-title">Prompt it.</span>
            <br />
            <span className="studio-gradient-accent">Scene by scene.</span>
          </h1>

          <p className="studio-fade-in-delay mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Describe your vision, pick a cinematic template, generate scene
            images, and render a polished video—all in one glass studio.
          </p>

          <div className="studio-fade-in-delay mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href="/login"
              className={cn(
                buttonVariants({
                  variant: "primary",
                  size: "lg",
                  shine: false,
                }),
                "studio-btn-primary relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgb(99_102_241/0.55)] active:scale-[0.98]"
              )}
            >
              <span className="relative z-10">Start creating</span>
            </Link>
            <Link
              href="/images"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg", shine: false }),
                "studio-btn-ghost rounded-2xl border-white/12 bg-white/[0.04] text-zinc-200 backdrop-blur-sm"
              )}
            >
              Open studio
            </Link>
          </div>

          <div className="studio-fade-in-delay mt-20 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                k: "01",
                t: "Describe",
                d: "Write mood, lighting, and motion in natural language.",
              },
              {
                k: "02",
                t: "Generate",
                d: "AI builds each scene with live progress in the studio.",
              },
              {
                k: "03",
                t: "Render",
                d: "Preview images and export your cinematic video.",
              },
            ].map((step) => (
              <div
                key={step.k}
                className="studio-panel rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left backdrop-blur-sm"
              >
                <p className="mb-2 font-mono text-[10px] text-indigo-400/90">
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
          Lene Video · Cinematic image studio ·{" "}
          <span className="text-zinc-500">Sign in to connect to your API</span>
        </footer>
      </PageShell>
    </LenePageShell>
  );
}
