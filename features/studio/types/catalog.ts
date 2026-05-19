export type StudioTemplate = {
  id: string;
  /** Sent as `templateKey` on `POST /api/images/generate`. */
  key: string;
  name: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  defaultSceneCount?: number | null;
  defaultDurationSec?: number | null;
  defaultAspectRatio?: string | null;
};

export type StudioMotionPreset = {
  id: string;
  key: string;
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
