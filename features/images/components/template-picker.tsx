"use client";

import type { StudioTemplate } from "@/features/studio/types";
import { memo, useMemo } from "react";

const TEMPLATE_ICONS: Record<string, string> = {
  cinematic_trailer: "🎬",
  motivational_reel: "🔥",
  horror_story: "👁",
  luxury_ad: "✨",
  documentary: "📽",
  anime_sequence: "⚡",
  social_reel: "📱",
  product_promo: "📦",
};

function iconFor(key: string): string {
  return TEMPLATE_ICONS[key] ?? "🎞";
}

type TemplatePickerProps = {
  templates: StudioTemplate[];
  templateKey: string;
  onSelect: (key: string) => void;
  loading?: boolean;
  catalogError?: string | null;
};

function TemplatePickerInner({
  templates,
  templateKey,
  onSelect,
  loading,
  catalogError,
}: TemplatePickerProps) {
  const selected = useMemo(
    () => templates.find((t) => t.key === templateKey) ?? templates[0],
    [templates, templateKey]
  );

  if (loading && templates.length === 0) {
    return (
      <div className="mb-6 space-y-3" aria-busy="true">
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] w-[140px] shrink-0 animate-pulse rounded-xl bg-zinc-800/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
          Style template
        </span>
        {catalogError ? (
          <span className="text-[10px] text-amber-400/90">Catalog offline</span>
        ) : null}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {templates.map((t) => {
          const active = t.key === templateKey;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              className={`flex w-[min(100%,152px)] shrink-0 flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition ${
                active
                  ? "border-violet-500/60 bg-violet-500/15 shadow-[0_0_24px_-6px_rgb(139_92_246/0.55)] ring-1 ring-violet-400/30"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {iconFor(t.key)}
              </span>
              <span
                className={`text-xs font-semibold leading-tight ${
                  active ? "text-violet-100" : "text-zinc-200"
                }`}
              >
                {t.name}
              </span>
              {t.defaultSceneCount != null ? (
                <span className="text-[10px] text-zinc-500">
                  {t.defaultSceneCount} scenes
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {selected?.description ? (
        <p className="text-sm leading-relaxed text-zinc-400">
          {selected.description}
        </p>
      ) : null}
    </div>
  );
}

export const TemplatePicker = memo(TemplatePickerInner);
