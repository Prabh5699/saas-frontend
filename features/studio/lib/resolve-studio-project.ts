import { parseProjectsApiList } from "../adapters/projects";
import { listProjects } from "../api/projects";
import type { StudioProjectSummary } from "../types";

export function findStudioProjectIdForImage(
  summaries: StudioProjectSummary[],
  imageProjectId: string
): string | null {
  const match = summaries.find(
    (p) => p.legacyImageProjectId === imageProjectId
  );
  return match?.id ?? null;
}

export async function resolveStudioProjectIdForImage({
  imageProjectId,
  token,
}: {
  imageProjectId: string;
  token: string;
}): Promise<string | null> {
  const { res, data } = await listProjects(token);
  if (!res.ok || data == null) return null;
  return findStudioProjectIdForImage(
    parseProjectsApiList(data),
    imageProjectId
  );
}
