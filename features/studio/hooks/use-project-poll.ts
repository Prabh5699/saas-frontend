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

const POLL_INTERVAL_MS = 3000;

type UseProjectPollOptions = {
  projectId: string | null;
  projectFailed: boolean;
  shouldPoll: boolean;
  progressRef: React.RefObject<number>;
  onPatch: (patch: ProjectDetailPatch) => void;
  onCompleteGeneration: () => void;
  onProjectGone: () => void;
  onProjectFailed: (message: string) => void;
  onPollError: (message: string) => void;
  disconnectSocket: () => void;
};

export function useProjectPoll({
  projectId,
  projectFailed,
  shouldPoll,
  progressRef,
  onPatch,
  onCompleteGeneration,
  onProjectGone,
  onProjectFailed,
  onPollError,
  disconnectSocket,
}: UseProjectPollOptions) {
  const onPatchRef = useRef(onPatch);
  const onCompleteGenerationRef = useRef(onCompleteGeneration);
  const onProjectGoneRef = useRef(onProjectGone);
  const onProjectFailedRef = useRef(onProjectFailed);
  const onPollErrorRef = useRef(onPollError);
  const disconnectSocketRef = useRef(disconnectSocket);
  const progressRefStable = useRef(progressRef);
  onPatchRef.current = onPatch;
  onCompleteGenerationRef.current = onCompleteGeneration;
  onProjectGoneRef.current = onProjectGone;
  onProjectFailedRef.current = onProjectFailed;
  onPollErrorRef.current = onPollError;
  disconnectSocketRef.current = disconnectSocket;
  progressRefStable.current = progressRef;

  useEffect(() => {
    if (!shouldPoll || !projectId || projectFailed) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let stopped = false;
    const id = projectId;

    const clearPollInterval = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const pollOnce = async () => {
      if (stopped) return;
      try {
        const { res, data, legacy, studio } =
          await fetchStudioProjectDetailLegacyView({
            id,
            headers: getStudioAuthHeaders(),
          });

        if (res.status === 404 || res.status === 403) {
          onProjectGoneRef.current();
          clearPollInterval();
          return;
        }

        if (!res.ok || !data) return;

        const fail = projectStatusFailure(data);
        if (fail.fail) {
          onProjectFailedRef.current(fail.message);
          disconnectSocketRef.current();
          clearPollInterval();
          return;
        }

        const patch =
          studio != null
            ? patchFromStudioDetail(studio)
            : legacy != null
              ? patchFromLegacyResponse(legacy)
              : null;
        if (!patch) return;

        onPatchRef.current(patch);

        if (patch.progress != null && patch.progress >= 100) {
          onCompleteGenerationRef.current();
        }

        const hasVideo = Boolean(patch.videoUrl);
        const videoState = (patch.videoStatus ?? "").toLowerCase();
        if (
          hasVideo ||
          videoState === "completed" ||
          videoState === "failed"
        ) {
          clearPollInterval();
        }
      } catch (err) {
        const msg = getApiErrorMessage(err, "");
        if (msg && progressRefStable.current.current === 0) {
          onPollErrorRef.current(msg);
        }
      }
    };

    void (async () => {
      await pollOnce();
      if (stopped) return;
      intervalId = setInterval(() => void pollOnce(), POLL_INTERVAL_MS);
    })();

    return () => {
      stopped = true;
      clearPollInterval();
    };
  }, [shouldPoll, projectId, projectFailed]);
}
