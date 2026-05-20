"use client";

import type { StudioTemplate } from "@/features/studio/types";
import { memo, useMemo } from "react";
import { sectionLabel } from "../lib/studio-ui-styles";

const STYLES_DATA = [
  { label: "Cinematic Trailer", icon: "🎬", desc: "Epic shots, lens flares" },
  { label: "Motivational Reel", icon: "⚡", desc: "Bold cuts, energy" },
  { label: "Horror Story", icon: "🌑", desc: "Dread, harsh contrast" },
  { label: "Luxury Ad", icon: "💎", desc: "Slow motion, refined" },
  { label: "Documentary", icon: "📽", desc: "Raw, ambient realism" },
  { label: "Noir", icon: "🌧", desc: "Shadows, moral weight" },
  { label: "Anime Sequence", icon: "✨", desc: "Stylized motion, vibrant" },
  { label: "Social Reel", icon: "📱", desc: "Vertical, punchy hooks" },
  { label: "Product Promo", icon: "🛍", desc: "Feature highlights, CTA" },
] as const;

const STYLE_LOOKUP = Object.fromEntries(
  STYLES_DATA.map((s) => [s.label.toLowerCase(), s])
);

function styleMeta(template: StudioTemplate) {
  const hit = STYLE_LOOKUP[template.name.toLowerCase()];
  if (hit) return hit;
  return {
    label: template.name,
    icon: "🎨",
    desc: template.description ?? "",
  };
}

type TemplatePickerProps = {
  templates: StudioTemplate[];
  templateKey: string;
  onSelect: (key: string) => void;
  loading?: boolean;
  catalogError?: string | null;
};

function TemplatePickerInner({
  templates,
  templateKey,
  onSelect,
  loading,
  catalogError,
}: TemplatePickerProps) {
  const ordered = useMemo(() => {
    const byName = new Map(templates.map((t) => [t.name.toLowerCase(), t]));
    const picked: StudioTemplate[] = [];
    const seen = new Set<string>();

    for (const s of STYLES_DATA) {
      const t = byName.get(s.label.toLowerCase());
      if (t) {
        picked.push(t);
        seen.add(t.key);
      }
    }
    for (const t of templates) {
      if (!seen.has(t.key)) picked.push(t);
    }
    return picked;
  }, [templates]);

  if (loading && templates.length === 0) {
    return (
      <div aria-busy="true">
        <div style={{ ...sectionLabel, margin: "0 0 8px", marginTop: 0 }}>
          Style template
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              style={{
                height: 44,
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ ...sectionLabel, margin: "0 0 8px", marginTop: 0 }}>
        Style template
        {catalogError ? (
          <span
            style={{
              marginLeft: 8,
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
              color: "rgba(96,120,200,0.35)",
            }}
          >
            · offline
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 16,
        }}
      >
        {ordered.map((t) => {
          const active = t.key === templateKey;
          const meta = styleMeta(t);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              className={
                active
                  ? "studio-template-card studio-template-card--active"
                  : "studio-template-card"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 11px",
                borderRadius: 10,
                cursor: "pointer",
                background: active
                  ? "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(59,130,246,0.1))"
                  : "rgba(255,255,255,0.03)",
                border: active
                  ? "1px solid rgba(129,140,248,0.45)"
                  : "1px solid rgba(255,255,255,0.08)",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  flexShrink: 0,
                  width: 20,
                  textAlign: "center",
                }}
              >
                {meta.icon}
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: active ? "#93c5fd" : "rgba(148,163,220,0.65)",
                  }}
                >
                  {meta.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 10,
                    color: "rgba(96,120,200,0.4)",
                    marginTop: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {meta.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export const TemplatePicker = memo(TemplatePickerInner);
