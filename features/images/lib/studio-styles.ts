import { cn } from "@/lib/utils";

/**
 * Studio design tokens — pixel-exact, dedicated CSS classes live in
 * `app/globals.css` under "Studio — pixel-exact match to reference HTML".
 *
 * Components reference these constants, never inline Tailwind arbitrary
 * values, so the spec lives in one place.
 */

export const studioAppClass = "studio-app";

export const studioSidebarBgClass = "studio-sidebar-bg";
export const studioWorkspaceBgClass = "studio-workspace-bg";
export const studioPreviewBgClass = "studio-preview-bg";

export const studioLogoArea = "studio-logo-area";
export const studioLogo = "studio-logo";
export const studioLogoSub = "studio-logo-sub";

export const studioNavSection = "studio-nav-section";
export const studioSectionLabel = "studio-label";
export const studioSidebarLabel = "studio-label";
export const studioPreviewSectionLabel = "studio-preview-label";

export const studioSearchWrap = "studio-search-wrap";
export const studioSearchInput = "studio-search";

export const studioProjectList = "studio-project-list";

export const studioSidebarBottom = "studio-sidebar-bottom";
export const studioSidebarLink = "studio-sidebar-link";
export const studioAvatar = "studio-avatar";

export const studioWorkspaceInner = "studio-workspace-inner";
export const studioH1 = "studio-h1";
export const studioSubtext = "studio-subtext";

export const studioPromptBox = "studio-prompt-box";
export const studioTextarea = "studio-textarea";
export const studioCharCount = "studio-char-count";
export const studioFieldLabel = "studio-field-label";

export const studioPillsRow = "studio-pills-row";
export const studioPillDesc = "studio-pill-desc";
export const studioSceneRow = "studio-scene-row";

export const studioGenerateBtn = "studio-generate";
export const studioGenerateSecondaryBtn = "studio-generate-secondary";

export const studioPreviewTopbar = "studio-preview-topbar";
export const studioPreviewPrice = "studio-preview-price";
export const studioPreviewDownload = "studio-preview-download";

export const studioVideoFrame = "studio-video-frame";

export const studioStatusRow = "studio-status-row";
export const studioReadyPill = "studio-ready-pill";
export const studioReadyDot = "studio-ready-dot";
export const studioBusyPill = "studio-busy-pill";
export const studioBusyDot = "studio-busy-dot";

export const studioStoryboard = "studio-storyboard";
export const studioStoryboardLabel = "studio-storyboard-label";
export const studioThumbsStrip = "studio-thumbs-strip";
export const studioThumbBadge = "studio-thumb-badge";

export const studioStripClass = "studio-strip";
export const studioStripScrollClass = "studio-strip";

export const studioScrollClass = "studio-scroll";

export const studioSelectInput = "studio-select";
export const studioCheckRow = "studio-check-row";

export function studioNavItem(active: boolean) {
  return cn("studio-nav lene-nav", active && "is-active");
}

export function studioPill(active: boolean) {
  return cn("studio-pill lene-pill", active && "is-active");
}

export function studioSceneBtn(active: boolean) {
  return cn("studio-scene-btn lene-scene", active && "is-active");
}

export function studioSceneInput(active: boolean) {
  return cn("studio-scene-input lene-scene", active && "is-active");
}

export function studioStoryboardThumb(active: boolean) {
  return cn("studio-thumb lene-thumb", active && "is-active");
}

export function studioProjectRow(active: boolean) {
  return cn("studio-project lene-proj", active && "is-active");
}

export function studioMutedLink(extra?: string) {
  return cn("studio-link-muted lene-link-muted", extra);
}

export function studioGhostLink(extra?: string) {
  return cn("studio-preview-download lene-dl", extra);
}

export const studioGlowBlue = "studio-glow-blue";
export const studioGlowIndigo = "studio-glow-indigo";

/** @deprecated — keep until all imports migrate */
export const studioTemplatePill = studioPill;
/** @deprecated */
export const studioCtaBtn = "studio-generate";
