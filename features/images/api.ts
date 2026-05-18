/**
 * Legacy image API surface — delegates to `features/studio/api/legacy-images`.
 * New code should import from `@/features/studio` (facade + routes).
 */
import {
  deleteLegacyImageProject,
  generateLegacyImages,
  getLegacyImageProject,
  listLegacyImageProjects,
  regenerateLegacyImageScene,
  renderLegacySlideshowVideo,
  searchLegacyImageProjects,
  setLegacyImageProjectFavorite,
  type RenderSlideshowBody,
} from "@/features/studio/api/legacy-images";

export type RenderVideoFromImagesBody = RenderSlideshowBody;

export const listImageProjects = listLegacyImageProjects;
export const searchImageProjects = searchLegacyImageProjects;
export const setImageProjectFavorite = setLegacyImageProjectFavorite;
export const deleteImageProject = deleteLegacyImageProject;
export const getImageProject = getLegacyImageProject;
export const regenerateImageScene = regenerateLegacyImageScene;
export const generateImages = generateLegacyImages;
export const renderVideoFromImages = renderLegacySlideshowVideo;
