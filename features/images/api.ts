/**
 * Image pipeline API — delegates to `features/studio/api/legacy-images`.
 * Library list: use `fetchStudioProjectListLegacyView` from the studio facade.
 */
import {
  deleteLegacyImageProject,
  generateLegacyImages,
  getLegacyImageProject,
  regenerateLegacyImageScene,
  renderLegacySlideshowVideo,
  setLegacyImageProjectFavorite,
  type RenderSlideshowBody,
} from "@/features/studio/api/legacy-images";

export type RenderVideoFromImagesBody = RenderSlideshowBody;

export const setImageProjectFavorite = setLegacyImageProjectFavorite;
export const deleteImageProject = deleteLegacyImageProject;
export const getImageProject = getLegacyImageProject;
export const regenerateImageScene = regenerateLegacyImageScene;
export const generateImages = generateLegacyImages;
export const renderVideoFromImages = renderLegacySlideshowVideo;
