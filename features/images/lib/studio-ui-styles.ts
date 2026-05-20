import type { CSSProperties } from "react";

export const STUDIO_PAGE_CLASS = "studio-page";

export const studioRoot: CSSProperties = {
  height: "100vh",
  display: "flex",
  overflow: "hidden",
  position: "relative",
  background:
    "linear-gradient(165deg, #030508 0%, #060a1a 35%, #0a1028 65%, #06091a 100%)",
  fontFamily: "Inter, var(--font-geist-sans), system-ui, sans-serif",
  color: "#e8eeff",
};

export const studioGlowOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background: `
    radial-gradient(ellipse 100% 80% at 50% -10%, rgba(139,92,246,0.22) 0%, transparent 55%),
    radial-gradient(ellipse 70% 60% at 15% 55%, rgba(59,130,246,0.14) 0%, transparent 50%),
    radial-gradient(ellipse 60% 55% at 88% 40%, rgba(236,72,153,0.12) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 72% 85%, rgba(34,211,238,0.1) 0%, transparent 45%),
    linear-gradient(180deg, transparent 0%, rgba(6,10,26,0.4) 88%, rgba(3,5,12,0.95) 100%)
  `,
};

export const studioLayoutRow: CSSProperties = {
  display: "flex",
  flex: 1,
  minWidth: 0,
  gap: 14,
  padding: 14,
  position: "relative",
  zIndex: 1,
  height: "100%",
};

export const glassPanel: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.01) 100%)",
  backdropFilter: "blur(28px) saturate(1.35)",
  WebkitBackdropFilter: "blur(28px) saturate(1.35)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 14,
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.03) inset, 0 24px 48px -24px rgba(0,0,0,0.65), 0 0 80px -20px rgba(99,102,241,0.12)",
};

export const sectionLabel: CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(148,163,220,0.55)",
};

export const navItemBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "8px 12px",
  paddingLeft: "12px",
  borderRadius: 8,
  fontSize: "13px",
  color: "rgba(148,163,220,0.55)",
  background: "transparent",
  border: "none",
  borderLeft: "2px solid transparent",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "inherit",
  textDecoration: "none",
  marginBottom: 2,
};

export const navItemActive: CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.08) 100%)",
  borderLeft: "2px solid #818cf8",
  paddingLeft: "10px",
  color: "#c7d2fe",
  fontWeight: 500,
  borderRadius: "8px",
};

export const heading: CSSProperties = {
  fontSize: "28px",
  fontWeight: 600,
  letterSpacing: "-0.03em",
  margin: "0 0 8px",
  lineHeight: 1.15,
};

export const subtext: CSSProperties = {
  fontSize: "13.5px",
  color: "rgba(148,163,220,0.65)",
  margin: "0 0 22px",
  fontWeight: 400,
  lineHeight: 1.5,
};

export const promptBox: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0.03) 40%, rgba(34,211,238,0.04) 100%)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: "20px 22px",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  marginBottom: 16,
  position: "relative",
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.04) inset, 0 12px 40px -20px rgba(99,102,241,0.25)",
};

export const promptTextarea: CSSProperties = {
  width: "100%",
  minHeight: 88,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#d4dcff",
  fontSize: "14.5px",
  lineHeight: 1.7,
  resize: "none",
  fontFamily: "inherit",
  display: "block",
  boxSizing: "border-box",
  padding: 0,
};

export const generateBtn: CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: 12,
  border: "none",
  background:
    "linear-gradient(135deg, #4338ca 0%, #4f46e5 28%, #2563eb 58%, #0ea5e9 100%)",
  boxShadow:
    "0 0 32px rgba(99,102,241,0.45), 0 4px 14px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.15) inset",
  color: "white",
  fontSize: "14px",
  fontWeight: 600,
  letterSpacing: "0.03em",
  cursor: "pointer",
  marginTop: "20px",
  fontFamily: "inherit",
};

export const pillInactive: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "999px",
  padding: "6px 14px",
  fontSize: "12px",
  color: "rgba(148,163,220,0.55)",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export const pillActive: CSSProperties = {
  background: "rgba(99,102,241,0.22)",
  border: "1px solid rgba(129,140,248,0.45)",
  borderRadius: "999px",
  padding: "6px 14px",
  fontSize: "12px",
  color: "#c7d2fe",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export const videoFrame: CSSProperties = {
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow:
    "0 0 48px rgba(99,102,241,0.22), 0 0 80px -20px rgba(34,211,238,0.15), 0 24px 64px rgba(0,0,0,0.55)",
  aspectRatio: "16 / 9",
  margin: 14,
  flexShrink: 0,
  position: "relative",
  background: "#050c2a",
};

export const projectName: CSSProperties = {
  fontSize: "12px",
  color: "rgba(200,210,255,0.85)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: 1.3,
};

export const projectDate: CSSProperties = {
  fontSize: "10px",
  color: "rgba(148,163,220,0.5)",
  marginTop: "2px",
};

export const recentSectionLabel: CSSProperties = {
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(148,163,220,0.5)",
  padding: "0 14px",
  margin: "14px 0 8px",
};
