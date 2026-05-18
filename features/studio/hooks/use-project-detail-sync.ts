"use client";

import { fetchStudioProjectDetailLegacyView } from "@/features/studio/api/facade";
import {
  patchFromLegacyResponse,
  patchFromStudioDetail,
} from "@/features/studio/lib/apply-project-detail";
import { projectStatusFailure } from "@/features/studio/lib/project-failure";
import type { ProjectDetailPatch } from "@/features/studio/lib/apply-project-detail";
import { getApiErrorMessage } from "@/lib/api";
import { useEffect, useRef } from "react";
import { getStudioAuthHeaders } from "./studio-auth";

type UseProjectDetailSyncOptions = {
  projectId: string | null;
  projectFailed: boolean;
  onPatch: (patch: ProjectDetailPatch) => void;
  onCompleteGeneration: () => void;
  onProjectGone: () => void;
  onProjectFailed: (message: string) => void;
  onLoadError: (message: string) => void;
  disconnectSocket: () => void;
};

/** One-shot fetch when `projectId` changes (not interval polling). */
export function useProjectDetailSync({
  projectId,
  projectFailed,
  onPatch,
  onCompleteGeneration,
  onProjectGone,
  onProjectFailed,
  onLoadError,
  disconnectSocket,
}: UseProjectDetailSyncOptions) {
  const onPatchRef = useRef(onPatch);
  const onCompleteGenerationRef = useRef(onCompleteGeneration);
  const onProjectGoneRef = useRef(onProjectGone);
  const onProjectFailedRef = useRef(onProjectFailed);
  const onLoadErrorRef = useRef(onLoadError);
  const disconnectSocketRef = useRef(disconnectSocket);
  onPatchRef.current = onPatch;
  onCompleteGenerationRef.current = onCompleteGeneration;
  onProjectGoneRef.current = onProjectGone;
  onProjectFailedRef.current = onProjectFailed;
  onLoadErrorRef.current = onLoadError;
  disconnectSocketRef.current = disconnectSocket;

  useEffect(() => {
    if (!projectId || projectFailed) return;
    let cancelled = false;

    void (async () => {
      try {
        const { res, data, legacy, studio } =
          await fetchStudioProjectDetailLegacyView({
            id: projectId,
            headers: getStudioAuthHeaders(),
          });
        if (cancelled) return;

        if (res.status === 404 || res.status === 403) {
          onProjectGoneRef.current();
          return;
        }

        if (!res.ok || !data) return;

        const failed = projectStatusFailure(data);
        if (failed.fail) {
          onProjectFailedRef.current(failed.message);
          disconnectSocketRef.current();
          return;
        }

        const patch =
          studio != null
            ? patchFromStudioDetail(studio)
            : legacy != null
              ? patchFromLegacyResponse(legacy)
              : null;
        if (!patch || cancelled) return;

        onPatchRef.current(patch);

        if (patch.progress != null && patch.progress >= 100) {
          onCompleteGenerationRef.current();
        }
      } catch (err) {
        if (!cancelled) {
          onLoadErrorRef.current(
            getApiErrorMessage(err, "Could not load image project.")
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, projectFailed]);
}
