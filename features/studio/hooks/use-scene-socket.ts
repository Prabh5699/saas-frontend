"use client";

import { STUDIO_SOCKET_NAMESPACE } from "@/features/studio/config";
import { API_BASE } from "@/lib/api";
import { useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

type UseSceneSocketOptions = {
  projectId: string | null;
  projectFailed: boolean;
  onImageUpdate: (payload: unknown) => void;
  onProjectFailed: (message: string) => void;
};

export function useSceneSocket({
  projectId,
  projectFailed,
  onImageUpdate,
  onProjectFailed,
}: UseSceneSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onImageUpdateRef = useRef(onImageUpdate);
  const onProjectFailedRef = useRef(onProjectFailed);
  onImageUpdateRef.current = onImageUpdate;
  onProjectFailedRef.current = onProjectFailed;

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!projectId || projectFailed) {
      disconnectSocket();
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket: Socket = io(`${API_BASE}${STUDIO_SOCKET_NAMESPACE}`, {
      auth: { token },
    });
    socketRef.current = socket;
    socket.emit("joinProject", { projectId });

    const onImageUpdateEvent = (payload: unknown) => {
      onImageUpdateRef.current(payload);
    };
    const onProjectFailedEvent = (payload: unknown) => {
      const msg =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : "Image generation failed.";
      onProjectFailedRef.current(msg);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };

    socket.on("image_update", onImageUpdateEvent);
    socket.on("project_failed", onProjectFailedEvent);

    return () => {
      socket.off("image_update", onImageUpdateEvent);
      socket.off("project_failed", onProjectFailedEvent);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [projectId, projectFailed, disconnectSocket]);

  useEffect(() => {
    return () => disconnectSocket();
  }, [disconnectSocket]);

  return { disconnectSocket };
}
