"use client";

import type { StudioMotionPreset, StudioScene } from "@/features/studio/types";
import { memo } from "react";

const READINESS_OPTIONS = [
  { value: "not_ready", label: "Not ready" },
  { value: "ready", label: "Ready" },
  { value: "blocked", label: "Blocked" },
] as const;

type ImageSceneStripProps = {
  scenes: StudioScene[];
  motionPresets: StudioMotionPreset[];
  studioProjectId: string | null;
  patchingScene: number | null;
  onPatchScene: (
    sceneNumber: number,
    patch: {
      renderReadiness?: string;
      motionPresetKey?: string | null;
    }
  ) => void;
};

function presetKey(p: StudioMotionPreset): string {
  return p.key ?? p.id;
}

function sceneMotionKey(scene: StudioScene): string {
  return scene.motionPresetKey ?? scene.motionPresetId ?? "";
}

function ImageSceneStripInner({
  scenes,
  motionPresets,
  studioProjectId,
  patchingScene,
  onPatchScene,
}: ImageSceneStripProps) {
  const withImages = scenes.filter((s) => Boolean(s.imageUrl));
  if (!studioProjectId || withImages.length === 0) return null;

  return (
    <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Scene studio
      </p>
      <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
        Set motion and render readiness before video render.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {withImages.map((scene) => {
          const busy = patchingScene === scene.sequence;
          const readiness = scene.renderReadiness ?? "not_ready";
          const motion = sceneMotionKey(scene);
          return (
            <div
              key={scene.sequence}
              className="w-[min(100%,200px)] shrink-0 rounded-xl border border-white/[0.08] bg-zinc-900/60 p-2"
            >
              <div className="relative mb-2 aspect-video overflow-hidden rounded-lg bg-zinc-800">
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white/90">
                  {scene.sequence}
                </span>
              </div>
              <label className="mb-1.5 block text-[10px] font-medium text-zinc-500">
                Readiness
                <select
                  disabled={busy}
                  value={readiness}
                  onChange={(e) =>
                    onPatchScene(scene.sequence, {
                      renderReadiness: e.target.value,
                    })
                  }
                  className="mt-0.5 w-full rounded-md border border-white/10 bg-zinc-950/80 px-1.5 py-1 text-[11px] text-zinc-200 outline-none focus:border-violet-500/40"
                >
                  {READINESS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              {motionPresets.length > 0 ? (
                <label className="block text-[10px] font-medium text-zinc-500">
                  Motion
                  <select
                    disabled={busy}
                    value={motion}
                    onChange={(e) =>
                      onPatchScene(scene.sequence, {
                        motionPresetKey: e.target.value || null,
                      })
                    }
                    className="mt-0.5 w-full rounded-md border border-white/10 bg-zinc-950/80 px-1.5 py-1 text-[11px] text-zinc-200 outline-none focus:border-violet-500/40"
                  >
                    <option value="">Default</option>
                    {motionPresets.map((p) => (
                      <option key={presetKey(p)} value={presetKey(p)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {busy ? (
                <p className="mt-1 text-[10px] text-violet-300/90">Saving…</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ImageSceneStrip = memo(ImageSceneStripInner);
