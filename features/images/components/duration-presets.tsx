import { memo } from "react";
import { VIDEO_DURATION_PRESETS } from "../constants";

type DurationPresetsProps = {
  value: number;
  onChange: (seconds: number) => void;
};

const btnBase = {
  width: 42,
  height: 34,
  borderRadius: 7,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

const btnActive = {
  background: "rgba(37,99,235,0.2)",
  border: "1px solid rgba(59,130,246,0.4)",
  color: "#93c5fd",
} as const;

const btnInactive = {
  color: "rgba(148,163,220,0.5)",
} as const;

function DurationPresetsInner({ value, onChange }: DurationPresetsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {VIDEO_DURATION_PRESETS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            ...btnBase,
            ...(value === n ? btnActive : btnInactive),
          }}
        >
          {n}s
        </button>
      ))}
    </div>
  );
}

export const DurationPresets = memo(DurationPresetsInner);
