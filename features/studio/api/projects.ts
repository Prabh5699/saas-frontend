import { apiFetch } from "@/lib/api";
import type { StudioScenePatch } from "../types";
import { PROJECT_ROUTES } from "./routes";

export async function listProjects(token: string) {
  return apiFetch(PROJECT_ROUTES.list, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    PROJECT_ROUTES.detail(id),
    { headers: { ...headers } },
    { throwOnError: false }
  );
}

export async function listProjectScenes({
  projectId,
  headers,
}: {
  projectId: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    PROJECT_ROUTES.scenes(projectId),
    { headers: { ...headers } },
    { throwOnError: false }
  );
}

export async function patchProjectScene({
  projectId,
  sceneNumber,
  patch,
  headers,
}: {
  projectId: string;
  sceneNumber: number | string;
  patch: StudioScenePatch;
  headers: Record<string, string>;
}) {
  return apiFetch(PROJECT_ROUTES.scene(projectId, sceneNumber), {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
}
