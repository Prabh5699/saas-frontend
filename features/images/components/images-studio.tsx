"use client";

import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { PageShell } from "@/components/layout/page-shell";
import Link from "next/link";
import { useImagesStudio } from "../hooks/use-images-studio";
import { ImageGridPanel } from "./image-grid-panel";
import { ImageHistoryPanel } from "./image-history-panel";
import { ImagePreviewModal } from "./image-preview-modal";
import { ImagePromptForm } from "./image-prompt-form";
import { WandIcon } from "./icons";

export function ImagesStudio() {
  const studio = useImagesStudio();

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
                Images
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={studio.handleClearHistory}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/15 hover:text-white"
            >
              Clear history
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            >
              Video studio
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={studio.handleLogout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-violet-300/90">
            <WandIcon className="h-3.5 w-3.5" />
            Text to images
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Describe it.
            </span>{" "}
            <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
              Watch scenes appear live.
            </span>
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
            Write a clear prompt - subject, mood, lighting - and generate
            multiple scenes. Images stream into the grid as each finishes.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 xl:gap-10">
          <ImageHistoryPanel {...studio} />
          <ImagePromptForm {...studio} />
          <ImageGridPanel {...studio} />
        </div>
      </PageShell>

      <ImagePreviewModal {...studio} />
    </div>
  );
}
