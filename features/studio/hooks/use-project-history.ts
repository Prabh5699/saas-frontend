"use client";

import type { ImageProject } from "@/features/images/types";
import {
  fetchStudioProjectListLegacyView,
  filterStudioProjectsByQuery,
} from "@/features/studio/api/facade";
import { getStudioAuthHeaders } from "@/features/studio/hooks/studio-auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  historyCreatedTime,
  historyProjectIsFavorite,
} from "@/features/images/utils";

export function useProjectHistory() {
  const [allHistory, setAllHistory] = useState<ImageProject[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setHistoryLoading(true);
    try {
      const list = await fetchStudioProjectListLegacyView(
        token,
        getStudioAuthHeaders()
      );
      setAllHistory(list);
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    void fetchHistory();
  }, [fetchHistory]);

  const history = useMemo(
    () => filterStudioProjectsByQuery(allHistory, historySearch),
    [allHistory, historySearch]
  );

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const fa = historyProjectIsFavorite(a) ? 1 : 0;
      const fb = historyProjectIsFavorite(b) ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return historyCreatedTime(b) - historyCreatedTime(a);
    });
  }, [history]);

  return {
    history,
    allHistory,
    allHistoryCount: allHistory.length,
    setHistory: setAllHistory,
    historySearch,
    setHistorySearch,
    sortedHistory,
    historyLoading,
    fetchHistory,
  };
}
