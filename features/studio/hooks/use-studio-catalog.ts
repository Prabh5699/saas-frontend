"use client";

import {
  parseMotionPresetsCatalog,
  parseTemplatesCatalog,
  parseVoiceProfilesCatalog,
} from "@/features/studio/adapters/projects";
import {
  listMotionPresets,
  listTemplates,
  listVoiceProfiles,
} from "@/features/studio/api/catalog";
import { useProjectsReads } from "@/features/studio/config";
import type {
  StudioMotionPreset,
  StudioTemplate,
  StudioVoiceProfile,
} from "@/features/studio/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { getStudioAuthHeaders } from "./studio-auth";

export function useStudioCatalog(enabled = true) {
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [motionPresets, setMotionPresets] = useState<StudioMotionPreset[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<StudioVoiceProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const loadCatalog = useCallback(async () => {
    if (!enabled || !useProjectsReads() || loadedRef.current) return;
    const headers = getStudioAuthHeaders();
    if (!headers.Authorization) return;

    setLoading(true);
    setError(null);
    try {
      const [tRes, mRes, vRes] = await Promise.all([
        listTemplates(headers),
        listMotionPresets(headers),
        listVoiceProfiles(headers),
      ]);
      if (tRes.res.ok && tRes.data != null) {
        setTemplates(parseTemplatesCatalog(tRes.data));
      }
      if (mRes.res.ok && mRes.data != null) {
        setMotionPresets(parseMotionPresetsCatalog(mRes.data));
      }
      if (vRes.res.ok && vRes.data != null) {
        setVoiceProfiles(parseVoiceProfilesCatalog(vRes.data));
      }
    } catch {
      setError("Could not load catalog.");
    } finally {
      setLoading(false);
      loadedRef.current = true;
    }
  }, [enabled]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return {
    templates,
    motionPresets,
    voiceProfiles,
    catalogLoading: loading,
    catalogError: error,
    reloadCatalog: loadCatalog,
  };
}
