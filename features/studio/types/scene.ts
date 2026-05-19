/** Normalized scene status across legacy and cinematic APIs. */
export type StudioSceneStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | (string & {});

export type StudioApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | (string & {});

export type StudioRenderReadiness =
  | "not_ready"
  | "ready"
  | "blocked"
  | (string & {});

/**
 * Canonical scene model for studio UI (timeline-ready).
 * `sequence` maps to legacy `scene_number` (1-based).
 */
export type StudioScene = {
  /** Stable id when backend provides one; null for legacy-only rows. */
  id: string | null;
  sequence: number;
  imageUrl: string | null;
  status?: StudioSceneStatus;
  approvalStatus?: StudioApprovalStatus;
  narrationOverride?: string | null;
  motionPresetId?: string | null;
  /** Catalog key for PATCH `motionPresetKey`. */
  motionPresetKey?: string | null;
  renderReadiness?: StudioRenderReadiness;
  prompt?: string | null;
  durationSeconds?: number | null;
  transitionStyle?: string | null;
  /** Narration line for slideshow / cinematic render. */
  narrationLine?: string | null;
};
