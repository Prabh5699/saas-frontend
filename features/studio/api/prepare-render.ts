import type { StudioScene } from "../types";
import { patchProjectScene } from "./projects";

/**
 * Backend cinematic render requires scenes to pass renderReadiness filters.
 * Mark completed scenes ready before slideshow POST (dual-write bridge).
 */
export async function prepareScenesForSlideshowRender({
  projectId,
  scenes,
  headers,
}: {
  projectId: string;
  scenes: StudioScene[];
  headers: Record<string, string>;
}): Promise<{ patched: number; failed: number }> {
  const eligible = scenes.filter((s) => Boolean(s.imageUrl));
  let patched = 0;
  let failed = 0;

  await Promise.all(
    eligible.map(async (scene) => {
      const sceneKey = scene.id ?? String(scene.sequence);
      try {
        const { res } = await patchProjectScene({
          projectId,
          sceneId: sceneKey,
          patch: {
            approvalStatus: "approved",
            renderReadiness: "ready",
            status: "completed",
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
