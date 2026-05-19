import { VIDEO_DURATION_PRESETS } from "../constants";
import { memo } from "react";

type DurationPresetsProps = {
  value: number;
  onChange: (seconds: number) => void;
  className?: string;
};

function DurationPresetsInner({
  value,
  onChange,
  className = "",
}: DurationPresetsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {VIDEO_DURATION_PRESETS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            value === n
              ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
              : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/15"
          }`}
        >
          {n}s
        </button>
      ))}
    </div>
  );
}

export const DurationPresets = memo(DurationPresetsInner);
