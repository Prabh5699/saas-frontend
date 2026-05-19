import { apiFetch } from "@/lib/api";
import { LEGACY_IMAGE_ROUTES } from "./routes";

export type RenderSlideshowBody = {
  videoDurationSeconds?: number;
  includeNarration?: boolean;
  voiceId?: string;
  includeMusic?: boolean;
  skipRenderReadinessCheck?: boolean;
};

export type GenerateImagesBody = {
  prompt: string;
  sceneCount: number;
  purpose?: string;
  templateKey?: string;
  voiceProfileKey?: string;
  async?: boolean;
};

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
  templateKey,
  voiceProfileKey,
  purpose = "cinematic",
  async = true,
  headers,
}: GenerateImagesBody & { headers: Record<string, string> }) {
  const body: Record<string, unknown> = {
    prompt,
    sceneCount,
    purpose,
    async,
  };
  if (templateKey) body.templateKey = templateKey;
  if (voiceProfileKey) body.voiceProfileKey = voiceProfileKey;

  return apiFetch(LEGACY_IMAGE_ROUTES.generate, {
    method: "POST",
    headers: { ...headers },
    body: JSON.stringify(body),
  });
}

/** Queue FFmpeg render; poll `GET /api/images/:id` for videoStatus / videoUrl. */
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
