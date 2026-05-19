/**
 * Route map aligned with NestJS backend (see integration prompt).
 * Do not call removed or unimplemented endpoints.
 */

/** Image pipeline: generate, poll, render, favorite, delete, regenerate. */
export const LEGACY_IMAGE_ROUTES = {
  detail: (id: string) => `/api/images/${id}`,
  favorite: (id: string) => `/api/images/${id}/favorite`,
  generate: "/api/images/generate",
  regenerate: (projectId: string, sceneNumber: number) =>
    `/api/images/${projectId}/regenerate/${sceneNumber}`,
  renderVideo: (projectId: string) => `/api/images/${projectId}/render-video`,
} as const;

/** Studio library + scene metadata (read + PATCH only). */
export const PROJECT_ROUTES = {
  list: "/api/projects",
  detail: (id: string) => `/api/projects/${id}`,
  scenes: (projectId: string) => `/api/projects/${projectId}/scenes`,
  scene: (projectId: string, sceneNumber: number | string) =>
    `/api/projects/${projectId}/scenes/${sceneNumber}`,
} as const;

export const CATALOG_ROUTES = {
  templates: "/api/catalog/templates",
  motionPresets: "/api/catalog/motion-presets",
  voiceProfiles: "/api/catalog/voice-profiles",
  storyboardCompilePreview: "/api/catalog/storyboard/compile-preview",
} as const;
