import type { StudioScene } from "./scene";

export type StudioProjectSummary = {
  id: string;
  prompt: string;
  thumbnail: string | null;
  progress: number | null;
  isFavorite: boolean;
  createdAt: string | null;
  totalScenes?: number;
  completedScenes?: number;
};

export type StudioRenderState = {
  videoUrl: string | null;
  videoStatus: string | null;
  videoError: string | null;
};

export type StudioProjectDetail = {
  id: string;
  storyboardId: string | null;
  scenes: StudioScene[];
  progress: number | null;
  totalCost: number | null;
  render: StudioRenderState;
};

/** Inputs for PATCH `/api/projects/:id/scenes/:sceneId` */
export type StudioScenePatch = {
  prompt?: string;
  narrationOverride?: string | null;
  motionPresetId?: string | null;
  approvalStatus?: string;
  renderReadiness?: string;
  status?: string;
  sequence?: number;
};
