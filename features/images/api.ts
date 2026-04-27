import { apiFetch } from "@/lib/api";

export async function listImageProjects(token: string) {
  return apiFetch("/api/images", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchImageProjects({
  query,
  token,
}: {
  query: string;
  token: string;
}) {
  return apiFetch(
    `/api/images/search/${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function setImageProjectFavorite({
  id,
  isFavorite,
  headers,
}: {
  id: string;
  isFavorite: boolean;
  headers: Record<string, string>;
}) {
  return apiFetch(`/api/images/${id}/favorite`, {
    method: "PATCH",
    headers: {
      ...headers,
    },
    body: JSON.stringify({ isFavorite }),
  });
}

export async function deleteImageProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    `/api/images/${id}`,
    {
      method: "DELETE",
      headers: { ...headers },
    },
    { throwOnError: false }
  );
}

export async function getImageProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    `/api/images/${id}`,
    {
      headers: { ...headers },
    },
    { throwOnError: false }
  );
}

export async function regenerateImageScene({
  projectId,
  sceneNumber,
  headers,
}: {
  projectId: string;
  sceneNumber: number;
  headers: Record<string, string>;
}) {
  return apiFetch(`/api/images/${projectId}/regenerate/${sceneNumber}`, {
    method: "POST",
    headers: {
      ...headers,
    },
  });
}

export async function generateImages({
  prompt,
  sceneCount,
  headers,
}: {
  prompt: string;
  sceneCount: number;
  headers: Record<string, string>;
}) {
  return apiFetch("/api/images/generate", {
    method: "POST",
    headers: {
      ...headers,
    },
    body: JSON.stringify({
      prompt,
      sceneCount,
      async: true,
    }),
  });
}

export type RenderVideoFromImagesBody = {
  videoDurationSeconds?: number;
  includeNarration?: boolean;
  voiceId?: string;
  includeMusic?: boolean;
};

/** Slideshow video from a completed image project. POST returns `{ success: true }`; poll GET /api/images/:id for videoStatus / videoUrl. */
export async function renderVideoFromImages({
  projectId,
  body,
  headers,
}: {
  projectId: string;
  body?: RenderVideoFromImagesBody;
  headers: Record<string, string>;
}) {
  return apiFetch(
    `/api/images/${projectId}/render-video`,
    {
      method: "POST",
      headers: { ...headers },
      body: JSON.stringify(body ?? {}),
    },
    { throwOnError: false }
  );
}
