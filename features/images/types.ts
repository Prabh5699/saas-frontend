export type SceneImage = {
  scene_number: number;
  imageUrl?: string | null;
  status?: string;
};

export type ImageProject = {
  id?: string | number;
  _id?: string | number;
  projectId?: string | number;
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
};
