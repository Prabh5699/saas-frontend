import type { StudioScene } from "../types";
import { patchProjectScene } from "./projects";

/**
 * Optional pre-render step: PATCH scenes on the studio project
 * (`projects.id`, not image project id).
 */
export async function prepareScenesForSlideshowRender({
  studioProjectId,
  scenes,
  headers,
}: {
  studioProjectId: string;
  scenes: StudioScene[];
  headers: Record<string, string>;
}): Promise<{ patched: number; failed: number }> {
  const eligible = scenes.filter((s) => Boolean(s.imageUrl));
  let patched = 0;
  let failed = 0;

  await Promise.all(
    eligible.map(async (scene) => {
      try {
        const { res } = await patchProjectScene({
          projectId: studioProjectId,
          sceneNumber: scene.sequence,
          patch: {
            approvalStatus: "approved",
            renderReadiness: "ready",
          },
          headers,
        });
        if (res.ok) patched += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    })
  );

  return { patched, failed };
}
