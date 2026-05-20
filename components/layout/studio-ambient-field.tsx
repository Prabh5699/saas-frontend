"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

/** Deterministic 0–1 — stable across renders on the client. */
function pseudo(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Spread angles so meteors cross from different edges (not all parallel). */
const METEOR_ANGLES_DEG = [-52, -28, -8, 18, 42, 68, 112, 148, -118, -88];

type StarSpec = {
  id: number;
  left: string;
  top: string;
  sizePx: string;
  delay: string;
  duration: string;
  opacity: string;
};

type MeteorSpec = {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  widthPx: string;
  angle: string;
  travelX: string;
  travelY: string;
};

type StudioAmbientFieldProps = {
  starCount?: number;
  meteorCount?: number;
};

export function StudioAmbientField({
  starCount = 52,
  meteorCount = 6,
}: StudioAmbientFieldProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo<StarSpec[]>(
    () =>
      Array.from({ length: starCount }, (_, i) => {
        const bright = pseudo(i, 3) > 0.82;
        const size = bright ? 2.5 : 1;
        const spreadCenter = i % 4 === 0;
        const leftPct = spreadCenter
          ? 22 + pseudo(i, 7) * 56
          : pseudo(i, 1) * 100;
        const topPct = spreadCenter
          ? 18 + pseudo(i, 8) * 64
          : pseudo(i, 2) * 100;
        return {
          id: i,
          left: `${leftPct.toFixed(2)}%`,
          top: `${topPct.toFixed(2)}%`,
          sizePx: `${size}px`,
          delay: `${(pseudo(i, 4) * 5).toFixed(2)}s`,
          duration: `${(2.2 + pseudo(i, 5) * 3.5).toFixed(2)}s`,
          opacity: (0.2 + pseudo(i, 6) * 0.6).toFixed(3),
        };
      }),
    [starCount]
  );

  const meteors = useMemo<MeteorSpec[]>(
    () =>
      Array.from({ length: meteorCount }, (_, i) => {
        const angleDeg = METEOR_ANGLES_DEG[i % METEOR_ANGLES_DEG.length];
        const rad = (angleDeg * Math.PI) / 180;
        const distance = 220 + pseudo(i, 15) * 140;
        const travelX = Math.cos(rad) * distance;
        const travelY = Math.sin(rad) * distance;
        return {
          id: i,
          left: `${(8 + pseudo(i, 10) * 84).toFixed(2)}%`,
          top: `${(5 + pseudo(i, 11) * 78).toFixed(2)}%`,
          delay: `${(i * 4.2 + pseudo(i, 12) * 7).toFixed(2)}s`,
          duration: `${(1.2 + pseudo(i, 13) * 1.1).toFixed(2)}s`,
          widthPx: `${40 + Math.floor(pseudo(i, 14) * 72)}px`,
          angle: `${angleDeg}deg`,
          travelX: `${travelX.toFixed(0)}px`,
          travelY: `${travelY.toFixed(0)}px`,
        };
      }),
    [meteorCount]
  );

  if (!mounted) return null;

  return (
    <div className="studio-ambient" aria-hidden>
      {stars.map((s) => (
        <span
          key={`star-${s.id}`}
          className="studio-star"
          style={
            {
              left: s.left,
              top: s.top,
              width: s.sizePx,
              height: s.sizePx,
              opacity: s.opacity,
              "--star-delay": s.delay,
              "--star-dur": s.duration,
            } as CSSProperties
          }
        />
      ))}
      {meteors.map((m) => (
        <span
          key={`meteor-${m.id}`}
          className="studio-meteor"
          style={
            {
              left: m.left,
              top: m.top,
              width: m.widthPx,
              "--meteor-delay": m.delay,
              "--meteor-dur": m.duration,
              "--meteor-angle": m.angle,
              "--meteor-dx": m.travelX,
              "--meteor-dy": m.travelY,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
