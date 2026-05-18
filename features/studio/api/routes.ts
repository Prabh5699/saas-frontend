/** Legacy image-project API (dual-write bridge on backend). */
export const LEGACY_IMAGE_ROUTES = {
  list: "/api/images",
  search: (query: string) =>
    `/api/images/search/${encodeURIComponent(query)}`,
  detail: (id: string) => `/api/images/${id}`,
  favorite: (id: string) => `/api/images/${id}/favorite`,
  generate: "/api/images/generate",
  regenerate: (projectId: string, sceneNumber: number) =>
    `/api/images/${projectId}/regenerate/${sceneNumber}`,
  renderVideo: (projectId: string) =>
    `/api/images/${projectId}/render-video`,
} as const;

/** Cinematic project / storyboard API. */
export const PROJECT_ROUTES = {
  list: "/api/projects",
  search: (query: string) =>
    `/api/projects/search/${encodeURIComponent(query)}`,
  detail: (id: string) => `/api/projects/${id}`,
  favorite: (id: string) => `/api/projects/${id}/favorite`,
  generate: "/api/projects/generate",
  scenes: (projectId: string) => `/api/projects/${projectId}/scenes`,
  scene: (projectId: string, sceneId: string) =>
    `/api/projects/${projectId}/scenes/${sceneId}`,
  regenerateScene: (projectId: string, sceneId: string) =>
    `/api/projects/${projectId}/scenes/${sceneId}/regenerate`,
  renderSlideshow: (projectId: string) =>
    `/api/projects/${projectId}/render-slideshow`,
  renderCinematic: (projectId: string) =>
    `/api/projects/${projectId}/render-cinematic`,
  storyboardCompile: (projectId: string) =>
    `/api/projects/${projectId}/storyboard/compile`,
} as const;

export const CATALOG_ROUTES = {
  templates: "/api/catalog/templates",
  motionPresets: "/api/catalog/motion-presets",
  voiceProfiles: "/api/catalog/voice-profiles",
} as const;
