"use client";

import { persistAuthSession } from "@/lib/auth-session";
import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Sign in failed. Check your details and try again."
        );
        return;
      }
      persistAuthSession(data);
      router.replace("/dashboard");
    } catch {
      setError("Could not reach the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        {/* Hero — desktop */}
        <aside className="animate-login-rise relative hidden flex-col justify-center gap-10 px-8 py-16 pl-10 pr-6 lg:flex xl:pl-14">
          <div
            aria-hidden
            className="absolute left-[12%] top-[18%] h-72 w-72 rounded-full bg-violet-500/10 blur-[90px] motion-reduce:opacity-30"
            style={{ animation: "pulse-ring 7s ease-in-out infinite" }}
          />
          <div className="relative">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400 backdrop-blur-md">
              <SparklesIcon className="h-3.5 w-3.5 text-violet-400" />
              Lene Video · Text to motion
            </p>
            <h2 className="max-w-lg text-balance text-4xl font-semibold tracking-tight text-white xl:text-[2.75rem] xl:leading-[1.08]">
              <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Describe a scene.
              </span>{" "}
              <span className="bg-gradient-to-br from-violet-200 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                Get AI video back.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-zinc-400">
              Write a prompt—subject, mood, camera, lighting—and Lene Video
              turns it into a clip you can preview in your studio. Sign in to
              generate, track jobs, and watch the result when it’s ready.
            </p>
          </div>

          <ul className="relative space-y-4">
            {[
              {
                title: "Prompt → AI video",
                body: "Send a text prompt and duration; your backend renders the clip.",
              },
              {
                title: "Secure sign-in",
                body: "JWT-backed auth—same session your API already trusts.",
              },
              {
                title: "Studio preview",
                body: "Open the dashboard to generate, poll status, and play the file.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm transition duration-300 hover:border-violet-500/20 hover:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300 ring-1 ring-white/10 transition group-hover:shadow-lg group-hover:shadow-violet-500/15">
                  <ShieldIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-6 border-t border-white/[0.06] pt-8 text-sm text-zinc-500">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">
                90s
              </p>
              <p className="text-xs uppercase tracking-wider">Max clip length</p>
            </div>
            <div className="h-10 w-px bg-white/10" aria-hidden />
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">
                Live
              </p>
              <p className="text-xs uppercase tracking-wider">Job status</p>
            </div>
          </div>
        </aside>

        {/* Form column */}
        <main className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-4 lg:py-16">
          <div className="animate-login-rise-delay-1 mb-10 flex w-full max-w-[420px] items-center gap-3 lg:max-w-none lg:justify-start">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-60 blur-lg motion-reduce:blur-none" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-600/30 ring-1 ring-white/15">
                <span className="text-lg font-bold tracking-tight text-white">
                  L
                </span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Lene
              </p>
              <p className="text-sm font-semibold text-zinc-100">Video</p>
            </div>
          </div>

          <div className="animate-login-rise-delay-2 w-full max-w-[420px]">
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

              <div className="relative overflow-hidden rounded-[1.3rem] border border-white/[0.09] bg-zinc-950/55 shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_24px_80px_-12px_rgb(0_0_0/0.65)] backdrop-blur-2xl">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/45 to-transparent"
                  aria-hidden
                />
                <div className="relative px-8 py-10 sm:px-10">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
                        <span className="bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                          Welcome back
                        </span>
                      </h1>
                      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-zinc-400">
                        Access your studio: write prompts, start AI video
                        generation, and preview clips when processing finishes.
                      </p>
                    </div>
                    <span
                      className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:inline"
                      title="Product"
                    >
                      Lene
                    </span>
                  </div>

                  <div className="mb-8 flex flex-wrap gap-2">
                    {["Prompt → video", "AI-generated", "JWT session"].map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400"
                      >
                        <span className="h-1 w-1 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgb(52_211_153/0.65)]" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <form className="space-y-5" onSubmit={handleLogin} noValidate>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                      >
                        Email
                      </label>
                      <div className="group relative">
                        <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-3 pl-11 pr-3 text-sm text-zinc-100 outline-none ring-0 transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="password"
                          className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                        >
                          Password
                        </label>
                        <a
                          href="#"
                          className="text-xs font-medium text-violet-400/95 transition hover:text-violet-300"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="group relative">
                        <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-3 pl-11 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
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
                    >
                      <>
                        Sign in
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                      </>
                    </Button>
                  </form>

                  <p className="mt-8 text-center text-sm text-zinc-500">
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

            <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-600">
              Encrypted sign-in to your API · Use a modern browser for video
              playback
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
