"use client";

import type { ImageProject } from "@/features/images/types";
import {
  fetchStudioProjectListLegacyView,
  searchStudioProjectsLegacyView,
} from "@/features/studio/api/facade";
import { getApiErrorMessage } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  historyCreatedTime,
  historyProjectId,
  historyProjectIsFavorite,
} from "@/features/images/utils";

export function useProjectHistory() {
  const [history, setHistory] = useState<ImageProject[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setHistoryLoading(true);
    try {
      const list = await fetchStudioProjectListLegacyView(token);
      setHistory(list);
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

  useEffect(() => {
    const q = historySearch.trim();
    if (q === "") return;

    const t = window.setTimeout(() => {
      void (async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        setHistoryLoading(true);
        try {
          const list = await searchStudioProjectsLegacyView({ query: q, token });
          setHistory(list);
        } catch (err) {
          console.warn(getApiErrorMessage(err, "Search failed"));
        } finally {
          setHistoryLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(t);
  }, [historySearch]);

  useEffect(() => {
    if (historySearch.trim() === "") {
      void fetchHistory();
    }
  }, [historySearch, fetchHistory]);

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
    setHistory,
    historySearch,
    setHistorySearch,
    sortedHistory,
    historyLoading,
    fetchHistory,
  };
}
