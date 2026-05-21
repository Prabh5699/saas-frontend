"use client";

import { useLoginForm } from "@/features/auth/hooks/use-login-form";
import { LenePageShell } from "@/components/layout/lene-page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeSlashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.274M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21M12 12h.01" />
    </svg>
  );
}

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    handleLogin,
  } = useLoginForm();

  return (
    <LenePageShell>
      <div className="mx-auto grid min-h-dvh max-w-[1180px] lg:h-dvh lg:max-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:overflow-hidden">
        {/* Hero — desktop */}
        <aside className="animate-login-rise relative hidden min-h-0 flex-col justify-center gap-5 px-6 py-6 pl-8 pr-5 lg:flex xl:gap-5 xl:pl-10 xl:pr-6">
          <div
            aria-hidden
            className="absolute left-[12%] top-[14%] h-56 w-56 rounded-full bg-violet-500/10 blur-[80px] motion-reduce:opacity-30"
            style={{ animation: "pulse-ring 7s ease-in-out infinite" }}
          />
          <div className="relative flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-50 blur-md motion-reduce:blur-none" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/25 ring-1 ring-white/15">
                <span className="text-sm font-bold text-white">L</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/80">
                Lene
              </p>
              <p className="text-sm font-semibold leading-tight text-zinc-100">
                Video
              </p>
              <p className="text-[10px] font-medium tracking-[0.12em] text-zinc-500">
                AI Cinematic Studio
              </p>
            </div>
          </div>

          <div className="relative">
            <p className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-md">
              <SparklesIcon className="h-3 w-3 text-violet-400" />
              Prompt-to-video platform
            </p>
            <h2 className="max-w-lg text-balance text-[1.875rem] font-semibold leading-[1.12] tracking-tight text-white xl:text-[2.125rem]">
              <span className="studio-gradient-title">Describe a scene.</span>{" "}
              <span className="studio-gradient-accent">Watch it render.</span>
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-zinc-400">
              Turn text prompts into cinematic videos—generate scene images,
              preview your storyboard, and render without leaving the studio.
            </p>
            <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">
              Prompt
              <span className="mx-2 text-violet-500/35" aria-hidden>
                ·
              </span>
              Create Scenes
              <span className="mx-2 text-violet-500/35" aria-hidden>
                ·
              </span>
              Export Video
            </p>
          </div>

          <ul className="relative space-y-2">
            {[
              {
                title: "Scene generation",
                body: "AI paints each frame with live progress and storyboard previews.",
              },
              {
                title: "Secure sign-in",
                body: "JWT-backed auth—same session your API already trusts.",
              },
              {
                title: "Cinematic studio",
                body: "Land in Image Studio after login—generate, render, and preview.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="group flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 backdrop-blur-sm transition duration-300 hover:border-violet-500/20 hover:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300 ring-1 ring-white/10 transition group-hover:shadow-lg group-hover:shadow-violet-500/15">
                  <ShieldIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-zinc-500">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-5 border-t border-white/[0.06] pt-4 text-sm text-zinc-500">
            <div>
              <p className="text-xl font-semibold tracking-tight text-white">
                90s
              </p>
              <p className="text-[10px] uppercase tracking-wider">
                Max clip length
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" aria-hidden />
            <div>
              <p className="text-xl font-semibold tracking-tight text-white">
                Live
              </p>
              <p className="text-[10px] uppercase tracking-wider">Job status</p>
            </div>
          </div>
        </aside>

        {/* Form column */}
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:max-h-dvh lg:overflow-hidden lg:px-4 lg:py-5">
          <div className="animate-login-rise-delay-1 mb-8 flex w-full max-w-[400px] items-center gap-3 lg:hidden">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-60 blur-lg motion-reduce:blur-none" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-600/30 ring-1 ring-white/15">
                <span className="text-base font-bold tracking-tight text-white">
                  L
                </span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Lene
              </p>
              <p className="text-sm font-semibold text-zinc-100">Video</p>
              <p className="text-[10px] font-medium tracking-[0.12em] text-zinc-500">
                AI Cinematic Studio
              </p>
            </div>
          </div>

          <div className="animate-login-rise-delay-2 w-full max-w-[400px]">
            {/* Rotating gradient ring */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-[1px] overflow-hidden rounded-[1.35rem] motion-reduce:hidden"
              >
                <div
                  className="absolute -inset-full opacity-70"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgb(139 92 246 / 0.5), rgb(217 70 239 / 0.35), rgb(34 211 238 / 0.25), rgb(139 92 246 / 0.5))",
                    animation: "spin-slow 22s linear infinite",
                  }}
                />
              </div>

              <div className="studio-panel relative overflow-hidden rounded-[1.2rem] border border-white/[0.09] bg-zinc-950/55 shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_24px_80px_-12px_rgb(0_0_0/0.65)] backdrop-blur-2xl">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/45 to-transparent"
                  aria-hidden
                />
                <div className="relative px-6 py-6 sm:px-7 lg:px-6 lg:py-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-[1.45rem]">
                        <span className="bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                          Welcome back
                        </span>
                      </h1>
                      <p className="mt-1.5 max-w-sm text-pretty text-xs leading-relaxed text-zinc-400 sm:text-[13px]">
                        Sign in to open Image Studio—create scenes, track
                        generation, and render your cinematic video.
                      </p>
                      <p className="mt-2 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-600 lg:hidden">
                        Prompt · Create Scenes · Export Video
                      </p>
                    </div>
                    <span
                      className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:inline"
                      title="Product"
                    >
                      Lene
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {["Scenes → video", "AI-generated", "JWT session"].map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                      >
                        <span className="h-1 w-1 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgb(52_211_153/0.65)]" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <form className="space-y-3.5" onSubmit={handleLogin} noValidate>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"
                      >
                        Email
                      </label>
                      <div className="group relative">
                        <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-2.5 pl-10 pr-3 text-sm text-zinc-100 outline-none ring-0 transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="password"
                          className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"
                        >
                          Password
                        </label>
                        <a
                          href="#"
                          className="text-[11px] font-medium text-violet-400/95 transition hover:text-violet-300"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="group relative">
                        <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-2.5 pl-10 pr-10 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-[18px] w-[18px]" />
                          ) : (
                            <EyeIcon className="h-[18px] w-[18px]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error ? (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-500/30 bg-red-500/[0.12] px-3 py-2.5 text-sm text-red-100/95 backdrop-blur-sm"
                      >
                        {error}
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      variant="heroPrimary"
                      loading={loading}
                      loadingLabel="Signing in…"
                      className="py-2.5"
                    >
                      <>
                        Sign in
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                      </>
                    </Button>
                  </form>

                  <p className="mt-5 text-center text-xs text-zinc-500">
                    New here?{" "}
                    <Link
                      href="/signup"
                      className="font-medium text-violet-400 transition hover:text-violet-300"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-zinc-600 lg:mt-3">
              Encrypted sign-in to your API · Use a modern browser for video
              playback
            </p>
          </div>
        </main>
      </div>
    </LenePageShell>
  );
}
