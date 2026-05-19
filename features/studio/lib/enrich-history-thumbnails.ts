import type { ImageProject } from "@/features/images/types";
import { historyImageProjectId } from "@/features/images/utils";
import { parseLegacyImagesProjectResponse } from "../adapters/legacy-images";
import { getLegacyImageProject } from "../api/legacy-images";

const MAX_THUMBNAIL_FETCHES = 24;
const FETCH_CONCURRENCY = 4;

function firstSceneThumbFromPayload(data: unknown): string | null {
  const legacy = parseLegacyImagesProjectResponse(data);
  if (!legacy?.scenes?.length) return null;
  const sorted = [...legacy.scenes].sort(
    (a, b) => a.scene_number - b.scene_number
  );
  for (const scene of sorted) {
    if (scene.imageUrl) return scene.imageUrl;
  }
  return null;
}

/**
 * `GET /api/projects` summaries often omit thumbnails.
 * Fill from `GET /api/images/:legacyImageProjectId` (first scene with imageUrl).
 */
export async function enrichHistoryThumbnails({
  projects,
  headers,
}: {
  projects: ImageProject[];
  headers: Record<string, string>;
}): Promise<ImageProject[]> {
  const needsThumb = projects.filter(
    (p) => !p.thumbnail && historyImageProjectId(p)
  );
  if (needsThumb.length === 0) return projects;

  const queue = needsThumb.slice(0, MAX_THUMBNAIL_FETCHES);
  const thumbByImageId = new Map<string, string>();

  let index = 0;
  async function worker() {
    while (index < queue.length) {
      const current = index++;
      const project = queue[current];
      const imageId = historyImageProjectId(project);
      if (!imageId || thumbByImageId.has(imageId)) continue;

      try {
        const { res, data } = await getLegacyImageProject({
          id: imageId,
          headers,
        });
        if (!res.ok) continue;
        const url = firstSceneThumbFromPayload(data);
        if (url) thumbByImageId.set(imageId, url);
      } catch {
        /* skip */
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(FETCH_CONCURRENCY, queue.length) }, () =>
      worker()
    )
  );

  if (thumbByImageId.size === 0) return projects;

  return projects.map((p) => {
    if (p.thumbnail) return p;
    const imageId = historyImageProjectId(p);
    const thumb = imageId ? thumbByImageId.get(imageId) : null;
    if (!thumb) return p;
    return { ...p, thumbnail: thumb };
  });
}
