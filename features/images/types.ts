/**
 * Legacy view types for the current image-grid UI.
 * Canonical models live in `@/features/studio/types`.
 */
export type SceneImage = {
  scene_number: number;
  imageUrl?: string | null;
  status?: string;
};

export type ImageProject = {
  id?: string | number;
  _id?: string | number;
  /** Legacy image project id — poll, render, WebSocket. */
  projectId?: string | number;
  /** Studio `projects.id` — PATCH scene metadata. */
  studioProjectId?: string;
  legacyImageProjectId?: string;
  /** False when the row has no linked `image_projects` id (pre dual-write). */
  imagePipelineLinked?: boolean;
  templateKey?: string;
  videoStatus?: string | null;
  prompt?: string;
  thumbnail?: string | null;
  progress?: number;
  totalScenes?: number;
  total_scenes?: number;
  completedScenes?: number;
  completed_scenes?: number;
  createdAt?: string;
  created_at?: string;
  isFavorite?: boolean;
  is_favorite?: boolean;
  favorite?: boolean | 1 | "1" | "true";
};

export type ImagesProjectResponse = {
  scenes: SceneImage[];
  progress: number | null;
  totalCost: number | null;
  videoUrl: string | null;
  videoStatus: string | null;
  videoError: string | null;
};

export type { StudioScene, StudioProjectDetail, StudioProjectSummary } from "@/features/studio/types";
