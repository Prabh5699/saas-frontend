"use client";

import { persistAuthSession } from "@/lib/auth-session";
import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE = "http://localhost:3001";

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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don’t match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        email: email.trim(),
        password,
      };
      const trimmedName = name.trim();
      if (trimmedName) body.name = trimmedName;

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(", ")
              : "Could not create account. Try a different email."
        );
        return;
      }
      persistAuthSession(data);
      router.push("/dashboard");
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "No token returned from backend" ||
          err.message.startsWith("Could not save session"))
      ) {
        setError(err.message);
      } else {
        setError("Could not reach the server. Is it running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <aside className="animate-login-rise relative hidden flex-col justify-center gap-8 px-8 py-16 pl-10 pr-6 lg:flex xl:pl-14">
          <div className="relative">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400 backdrop-blur-md">
              <SparklesIcon className="h-3.5 w-3.5 text-violet-400" />
              Join Lene Video
            </p>
            <h2 className="max-w-lg text-balance text-4xl font-semibold tracking-tight text-white xl:text-[2.5rem] xl:leading-[1.08]">
              <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Your studio
              </span>{" "}
              <span className="bg-gradient-to-br from-violet-200 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                starts here.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-zinc-400">
              Create an account, sign in with the same secure JWT flow, and jump
              straight into prompt-to-video generation.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li className="flex gap-3">
              <span className="text-violet-400">✓</span>
              <span>Dashboard access to generate & preview AI clips</span>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-400">✓</span>
              <span>Same API as sign-in—token saved for your session</span>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-400">✓</span>
              <span>Already have an account? Switch over in one click</span>
            </li>
          </ul>
        </aside>

        <main className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-4 lg:py-16">
          <div className="animate-login-rise-delay-1 mb-8 flex w-full max-w-[420px] items-center gap-3 lg:max-w-none lg:justify-start">
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
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/45 to-transparent" />
                <div className="relative px-8 py-9 sm:px-10">
                  <div className="mb-6">
                    <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
                      <span className="bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                        Create account
                      </span>
                    </h1>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-zinc-400">
                      Set up your Lene Video profile—then head to the studio to
                      generate AI video from prompts.
                    </p>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {["Prompt → video", "JWT session", "Studio access"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400"
                        >
                          <span className="h-1 w-1 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgb(52_211_153/0.65)]" />
                          {tag}
                        </span>
                      )
                    )}
                  </div>

                  <form className="space-y-4" onSubmit={handleSignup} noValidate>
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                      >
                        Name{" "}
                        <span className="font-normal normal-case tracking-normal text-zinc-600">
                          (optional)
                        </span>
                      </label>
                      <div className="group relative">
                        <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Jane Creator"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-3 pl-11 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

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
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-3 pl-11 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                      >
                        Password
                      </label>
                      <div className="group relative">
                        <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={8}
                          placeholder="At least 8 characters"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-3 pl-11 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                      >
                        Confirm password
                      </label>
                      <div className="group relative">
                        <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition group-focus-within:text-violet-400" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          required
                          placeholder="Repeat password"
                          className="w-full rounded-xl border border-white/[0.09] bg-zinc-900/50 py-3 pl-11 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:bg-zinc-900/70 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.12)]"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                      className="mt-2"
                      loading={loading}
                      loadingLabel="Creating account…"
                    >
                      <>
                        Create account
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                      </>
                    </Button>
                  </form>

                  <p className="mt-7 text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-violet-400 transition hover:text-violet-300"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-600">
              By signing up you agree to our terms of use · Encrypted connection
              to your API
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
