import { apiFetch } from "@/lib/api";
import { LEGACY_IMAGE_ROUTES } from "./routes";

export type RenderSlideshowBody = {
  videoDurationSeconds?: number;
  includeNarration?: boolean;
  voiceId?: string;
  includeMusic?: boolean;
  /** Legacy / bridge flags when backend supports skipping readiness gate */
  skipRenderReadinessCheck?: boolean;
  skipRenderReadiness?: boolean;
  forceRender?: boolean;
};

export async function listLegacyImageProjects(token: string) {
  return apiFetch(LEGACY_IMAGE_ROUTES.list, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchLegacyImageProjects({
  query,
  token,
}: {
  query: string;
  token: string;
}) {
  return apiFetch(LEGACY_IMAGE_ROUTES.search(query), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getLegacyImageProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    LEGACY_IMAGE_ROUTES.detail(id),
    { headers: { ...headers } },
    { throwOnError: false }
  );
}

export async function setLegacyImageProjectFavorite({
  id,
  isFavorite,
  headers,
}: {
  id: string;
  isFavorite: boolean;
  headers: Record<string, string>;
}) {
  return apiFetch(LEGACY_IMAGE_ROUTES.favorite(id), {
    method: "PATCH",
    headers: { ...headers },
    body: JSON.stringify({ isFavorite }),
  });
}

export async function deleteLegacyImageProject({
  id,
  headers,
}: {
  id: string;
  headers: Record<string, string>;
}) {
  return apiFetch(
    LEGACY_IMAGE_ROUTES.detail(id),
    { method: "DELETE", headers: { ...headers } },
    { throwOnError: false }
  );
}

export async function regenerateLegacyImageScene({
  projectId,
  sceneNumber,
  headers,
}: {
  projectId: string;
  sceneNumber: number;
  headers: Record<string, string>;
}) {
  return apiFetch(LEGACY_IMAGE_ROUTES.regenerate(projectId, sceneNumber), {
    method: "POST",
    headers: { ...headers },
  });
}

export async function generateLegacyImages({
  prompt,
  sceneCount,
  headers,
}: {
  prompt: string;
  sceneCount: number;
  headers: Record<string, string>;
}) {
  return apiFetch(LEGACY_IMAGE_ROUTES.generate, {
    method: "POST",
    headers: { ...headers },
    body: JSON.stringify({ prompt, sceneCount, async: true }),
  });
}

/** Slideshow video; poll project detail for videoStatus / videoUrl. */
export async function renderLegacySlideshowVideo({
  projectId,
  body,
  headers,
}: {
  projectId: string;
  body?: RenderSlideshowBody;
  headers: Record<string, string>;
}) {
  return apiFetch(
    LEGACY_IMAGE_ROUTES.renderVideo(projectId),
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
