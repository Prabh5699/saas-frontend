import { getApiErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { generateVideo, getVideoJob } from "../api";
import { extractJobId, extractVideoUrl } from "../utils";

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useVideoDashboard() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [statusHint, setStatusHint] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("access_token");
    } catch {
      /* ignore */
    }
    router.replace("/login");
  }, [router]);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Describe your video first—what should we create?");
      return;
    }
    setError(null);
    setStatusHint(null);
    setVideoUrl(null);
    setPendingJobId(null);
    setLoading(true);

    try {
      const { data } = await generateVideo({
        prompt: trimmed,
        duration,
        headers: authHeaders(),
      });

      const url = extractVideoUrl(data);
      const id = extractJobId(data);

      if (url) {
        setVideoUrl(url);
        setStatusHint("Your video is ready.");
        return;
      }

      if (id) {
        setPendingJobId(id);
        setStatusHint("Rendering frames—this can take a minute.");
        return;
      }

      setStatusHint(
        "Generation started. Check your API response shape if the preview stays empty."
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Network error. Is the API running?"));
    } finally {
      setLoading(false);
    }
  }, [duration, prompt]);

  useEffect(() => {
    if (!pendingJobId || videoUrl) return;

    const poll = async () => {
      try {
        const { data } = await getVideoJob({
          jobId: pendingJobId,
          headers: authHeaders(),
        });
        const url = extractVideoUrl(data);
        if (url) {
          setVideoUrl(url);
          setPendingJobId(null);
          setStatusHint("Your video is ready.");
          return;
        }
        if (data && typeof data === "object") {
          const st = (data as { status?: string }).status;
          if (st === "failed" || st === "error" || st === "cancelled") {
            setError("Generation stopped or failed.");
            setPendingJobId(null);
          }
        }
      } catch (err) {
        const msg = getApiErrorMessage(err, "");
        if (msg) setStatusHint(msg);
      }
    };

    poll();
    const interval = setInterval(poll, 2800);
    return () => clearInterval(interval);
  }, [pendingJobId, videoUrl]);

  return {
    prompt,
    setPrompt,
    duration,
    setDuration,
    loading,
    error,
    videoUrl,
    pendingJobId,
    statusHint,
    showLoader: Boolean(loading || (pendingJobId && !videoUrl)),
    handleLogout,
    handleGenerate,
  };
}
