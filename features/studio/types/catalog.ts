export type StudioTemplate = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  defaultSceneCount?: number | null;
};

export type StudioMotionPreset = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
};

export type StudioVoiceProfile = {
  id: string;
  name: string;
  provider?: string | null;
  previewUrl?: string | null;
};

export type StudioStoryboardCompilePreview = {
  storyboardId?: string | null;
  scenes: Array<{
    sequence: number;
    prompt?: string | null;
    durationSeconds?: number | null;
  }>;
  estimatedDurationSeconds?: number | null;
  pacingSummary?: string | null;
};
