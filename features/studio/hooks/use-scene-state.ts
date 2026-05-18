"use client";

import type { SceneImage } from "@/features/images/types";
import {
  isCompletedStatus,
  legacySocketPayloadToScenePatch,
  mergeStudioScenes,
  studioSceneToLegacyImage,
} from "@/features/studio/adapters/legacy-images";
import { normalizeAssetUrl } from "@/features/studio/lib/payload";
import type { StudioScene } from "@/features/studio/types";
import type { ProjectDetailPatch } from "@/features/studio/lib/apply-project-detail";
import { useCallback, useMemo, useState } from "react";

export function useSceneState() {
  const [scenes, setScenes] = useState<StudioScene[]>([]);
  const [storyboardId, setStoryboardId] = useState<string | null>(null);

  const sortedScenes = useMemo(
    () => [...scenes].sort((a, b) => a.sequence - b.sequence),
    [scenes]
  );

  const sortedImages = useMemo(
    (): SceneImage[] => sortedScenes.map(studioSceneToLegacyImage),
    [sortedScenes]
  );

  const resetScenes = useCallback(() => {
    setScenes([]);
    setStoryboardId(null);
  }, []);

  const seedPlaceholderScenes = useCallback((count: number) => {
    setScenes(
      Array.from({ length: count }, (_, i) => ({
        id: null,
        sequence: i + 1,
        imageUrl: null,
        status: "pending",
      }))
    );
  }, []);

  const applyDetailPatch = useCallback((patch: ProjectDetailPatch) => {
    if (patch.storyboardId !== undefined) {
      setStoryboardId(patch.storyboardId);
    }
    if (patch.scenes && patch.scenes.length > 0) {
      setScenes((prev) => {
        if (prev.length === 0) return patch.scenes!;
        return mergeStudioScenes(prev, patch.scenes!);
      });
    }
  }, []);

  const applySocketPayload = useCallback((data: unknown) => {
    if (!data || typeof data !== "object") return null as number | null;
    const payload = data as Record<string, unknown>;
    const partial = legacySocketPayloadToScenePatch(payload);
    if (!partial || partial.sequence == null) return null;

    const sceneNumber = partial.sequence;
    const progressRaw = payload.progress;
    const progress =
      typeof progressRaw === "number" && !Number.isNaN(progressRaw)
        ? Math.min(100, Math.max(0, progressRaw))
        : null;

    const rawUrl = normalizeAssetUrl(payload.imageUrl ?? payload.image_url);
    const status =
      typeof payload.status === "string" ? payload.status : undefined;
    const completed = isCompletedStatus(status);

    setScenes((prev) => {
      const existing = prev.find((s) => s.sequence === sceneNumber);
      if (rawUrl == null && !completed) {
        if (!existing) {
          if (status == null) return prev;
          return [
            ...prev,
            {
              id: partial.id ?? null,
              sequence: sceneNumber,
              imageUrl: null,
              status,
            },
          ];
        }
        return prev.map((s) =>
          s.sequence === sceneNumber
            ? { ...s, ...(status != null ? { status } : {}) }
            : s
        );
      }

      const nextUrl =
        rawUrl != null
          ? rawUrl
          : existing?.imageUrl != null
            ? existing.imageUrl
            : null;
      const next: StudioScene = {
        id: partial.id ?? existing?.id ?? null,
        sequence: sceneNumber,
        imageUrl: nextUrl,
        status: status ?? existing?.status,
        approvalStatus: existing?.approvalStatus,
        narrationOverride: existing?.narrationOverride,
        motionPresetId: existing?.motionPresetId,
        renderReadiness: existing?.renderReadiness,
      };
      if (existing) {
        return prev.map((s) => (s.sequence === sceneNumber ? { ...s, ...next } : s));
      }
      return [...prev, { ...next, status: status ?? "pending" }];
    });

    return progress;
  }, []);

  return {
    scenes,
    sortedScenes,
    sortedImages,
    storyboardId,
    setScenes,
    resetScenes,
    seedPlaceholderScenes,
    applyDetailPatch,
    applySocketPayload,
  };
}
