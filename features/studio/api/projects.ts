import { apiFetch } from "@/lib/api";
import type { StudioScenePatch } from "../types";
import { PROJECT_ROUTES } from "./routes";

export async function listProjects(token: string) {
  return apiFetch(PROJECT_ROUTES.list, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchProjects({
  query,
  token,
}: {
  query: string;
  token: string;
}) {
  return apiFetch(PROJECT_ROUTES.search(query), {
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
  sceneId,
  patch,
  headers,
}: {
  projectId: string;
  sceneId: string;
  patch: StudioScenePatch;
  headers: Record<string, string>;
}) {
  return apiFetch(PROJECT_ROUTES.scene(projectId, sceneId), {
    method: "PATCH",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
}

export async function regenerateProjectScene({
  projectId,
  sceneId,
  headers,
}: {
  projectId: string;
  sceneId: string;
  headers: Record<string, string>;
}) {
  return apiFetch(PROJECT_ROUTES.regenerateScene(projectId, sceneId), {
    method: "POST",
    headers: { ...headers },
  });
}

export async function setProjectFavorite({
  id,
  isFavorite,
  headers,
}: {
  id: string;
  isFavorite: boolean;
  headers: Record<string, string>;
}) {
  return apiFetch(PROJECT_ROUTES.favorite(id), {
    method: "PATCH",
    headers: { ...headers },
    body: JSON.stringify({ isFavorite }),
  });
}

export async function deleteProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    PROJECT_ROUTES.detail(id),
    { method: "DELETE", headers: { ...headers } },
    { throwOnError: false }
  );
}

export async function generateProject({
  prompt,
  sceneCount,
  templateId,
  headers,
}: {
  prompt: string;
  sceneCount: number;
  templateId?: string;
  headers: Record<string, string>;
}) {
  return apiFetch(PROJECT_ROUTES.generate, {
    method: "POST",
    headers: { ...headers },
    body: JSON.stringify({
      prompt,
      sceneCount,
      templateId,
      async: true,
    }),
  });
}

export async function renderProjectSlideshow({
  projectId,
  body,
  headers,
}: {
  projectId: string;
  body?: Record<string, unknown>;
  headers: Record<string, string>;
}) {
  return apiFetch(
    PROJECT_ROUTES.renderSlideshow(projectId),
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    },
    { throwOnError: false }
  );
}

export async function compileStoryboardPreview({
  projectId,
  body,
  headers,
}: {
  projectId: string;
  body?: Record<string, unknown>;
  headers: Record<string, string>;
}) {
  return apiFetch(PROJECT_ROUTES.storyboardCompile(projectId), {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
}
