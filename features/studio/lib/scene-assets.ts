import { normalizeAssetUrl } from "./payload";

/** Collect scene still / frame URL from legacy or cinematic API shapes. */
export function extractSceneImageUrl(row: Record<string, unknown>): string | null {
  const direct = normalizeAssetUrl(
    row.imageUrl ??
      row.image_url ??
      row.url ??
      row.outputUrl ??
      row.output_url ??
      row.generatedImageUrl ??
      row.generated_image_url ??
      row.previewUrl ??
      row.preview_url ??
      row.frameUrl ??
      row.frame_url ??
      row.stillUrl ??
      row.still_url
  );
  if (direct) return direct;

  const image = row.image;
  if (image && typeof image === "object" && image !== null) {
    const img = image as Record<string, unknown>;
    const nested = normalizeAssetUrl(
      img.url ?? img.imageUrl ?? img.image_url ?? img.src
    );
    if (nested) return nested;
  }

  const asset = row.asset ?? row.primaryAsset ?? row.primary_asset;
  if (asset && typeof asset === "object" && asset !== null) {
    const a = asset as Record<string, unknown>;
    const nested = normalizeAssetUrl(a.url ?? a.imageUrl ?? a.image_url);
    if (nested) return nested;
  }

  for (const key of ["assets", "images", "frames"]) {
    const list = row[key];
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const url = extractSceneImageUrl(item as Record<string, unknown>);
      if (url) return url;
    }
  }

  return null;
}

export function extractSummaryThumbnail(
  row: Record<string, unknown>
): string | null {
  const direct = normalizeAssetUrl(
    row.thumbnail ?? row.thumbnailUrl ?? row.thumbnail_url ?? row.coverUrl
  );
  if (direct) return direct;

  for (const key of ["scenes", "images"]) {
    const list = row[key];
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const url = extractSceneImageUrl(item as Record<string, unknown>);
      if (url) return url;
    }
  }

  return null;
}
