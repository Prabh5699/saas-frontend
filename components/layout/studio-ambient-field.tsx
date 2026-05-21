"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/** Deterministic 0–1 — stable across renders on the client. */
function pseudo(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type StarDot = {
  id: number;
  left: string;
  top: string;
  sizePx: string;
  opacity: string;
  delay: string;
  duration: string;
};

type StarLayerConfig = {
  id: number;
  stars: StarDot[];
  parallax: number;
  className: string;
};

type Meteor = {
  id: string;
  lengthPx: number;
  durationMs: number;
  peakOpacity: number;
  angle: number;
  x0: string;
  y0: string;
  x2: string;
  y2: string;
};

type StudioAmbientFieldProps = {
  /** Softer on /images so UI stays readable. */
  variant?: "default" | "subtle";
};

type MeteorSpawnContext = {
  variant: "default" | "subtle";
  recentStarts: Array<{ x: number; y: number }>;
};

const LAYERS = [
  { count: 150, parallax: 12, opacityMin: 0.12, opacityMax: 0.28, sizeMax: 1.2 },
  { count: 80, parallax: 28, opacityMin: 0.28, opacityMax: 0.48, sizeMax: 1.6 },
  { count: 30, parallax: 46, opacityMin: 0.55, opacityMax: 0.82, sizeMax: 2.4 },
] as const;

const SKY_LANES = [
  { yMin: -14, yMax: 4, weight: 0.38 },
  { yMin: 4, yMax: 18, weight: 0.3 },
  { yMin: 18, yMax: 34, weight: 0.22 },
  { yMin: 34, yMax: 50, weight: 0.1 },
] as const;

const CARD_ZONE = {
  xMin: 54,
  xMax: 98,
  yMin: 28,
  yMax: 88,
};

const SPAWN_MIN_MS = 1_850;
const SPAWN_MAX_MS = 4_700;
const MIN_ACTIVE = 2;
const TARGET_ACTIVE = 2;
const MAX_EMPTY_MS = 5_500;
const WATCHDOG_MS = 1_800;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createMeteorId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pickLane() {
  const roll = Math.random();
  let cumulative = 0;
  for (const lane of SKY_LANES) {
    cumulative += lane.weight;
    if (roll <= cumulative) return lane;
  }
  return SKY_LANES[0];
}

function pointInCardZone(x: number, y: number) {
  return (
    x >= CARD_ZONE.xMin &&
    x <= CARD_ZONE.xMax &&
    y >= CARD_ZONE.yMin &&
    y <= CARD_ZONE.yMax
  );
}

function pathCrossesCardZone(
  x0: number,
  y0: number,
  x2: number,
  y2: number
) {
  const samples = 12;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = x0 + (x2 - x0) * t;
    const y = y0 + (y2 - y0) * t;
    if (pointInCardZone(x, y)) return true;
  }
  return false;
}

function isTooCloseToRecent(
  x: number,
  y: number,
  recentStarts: Array<{ x: number; y: number }>
) {
  return recentStarts.some(
    (point) => Math.abs(point.x - x) < 16 && Math.abs(point.y - y) < 10
  );
}

/** Top-right → bottom-left lanes, head leads left. */
function buildLanePath(): {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
} {
  const lane = pickLane();
  const slopeAngle = randomBetween(35, 55);
  const travel = randomBetween(108, 142);
  const rad = (slopeAngle * Math.PI) / 180;

  const startX = randomBetween(78, 118);
  const startY = randomBetween(lane.yMin, lane.yMax);
  const endX = startX - Math.cos(rad) * travel;
  const endY = startY + Math.sin(rad) * travel * 0.68;

  const dx = endX - startX;
  const dy = endY - startY;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    startX,
    startY,
    endX,
    endY,
    angle,
  };
}

function createMeteor(context: MeteorSpawnContext): Meteor | null {
  const maxAttempts = 12;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { startX, startY, endX, endY, angle } = buildLanePath();

    if (isTooCloseToRecent(startX, startY, context.recentStarts)) {
      continue;
    }

    if (pathCrossesCardZone(startX, startY, endX, endY) && Math.random() < 0.68) {
      continue;
    }

    const peakOpacity =
      context.variant === "subtle"
        ? randomBetween(0.16, 0.28)
        : randomBetween(0.2, 0.34);

    return {
      id: createMeteorId(),
      lengthPx: Math.round(randomBetween(140, 240)),
      durationMs: Math.round(randomBetween(4000, 8000)),
      peakOpacity,
      angle,
      x0: `${startX.toFixed(2)}vw`,
      y0: `${startY.toFixed(2)}vh`,
      x2: `${endX.toFixed(2)}vw`,
      y2: `${endY.toFixed(2)}vh`,
    };
  }

  return null;
}

function buildLayerStars(
  layerIndex: number,
  count: number,
  opacityMin: number,
  opacityMax: number,
  sizeMax: number,
  opacityScale: number
): StarDot[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = layerIndex * 10_000 + i;
    const size = 0.8 + pseudo(seed, 3) * (sizeMax - 0.8);
    const opacity =
      (opacityMin + pseudo(seed, 4) * (opacityMax - opacityMin)) * opacityScale;
    return {
      id: i,
      left: `${(pseudo(seed, 1) * 100).toFixed(2)}%`,
      top: `${(pseudo(seed, 2) * 100).toFixed(2)}%`,
      sizePx: `${size.toFixed(2)}px`,
      opacity: opacity.toFixed(3),
      delay: `${(pseudo(seed, 5) * 9).toFixed(2)}s`,
      duration: `${(3.2 + pseudo(seed, 6) * 5.5).toFixed(2)}s`,
    };
  });
}

export function StudioAmbientField({
  variant = "default",
}: StudioAmbientFieldProps) {
  const [mounted, setMounted] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  const meteorsRef = useRef<Meteor[]>([]);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMotionAtRef = useRef(Date.now());
  const recentStartsRef = useRef<Array<{ x: number; y: number }>>([]);

  const maxMeteors = variant === "subtle" ? 2 : 3;

  const rememberStart = useCallback((x0: string, y0: string) => {
    const x = Number.parseFloat(x0);
    const y = Number.parseFloat(y0);
    recentStartsRef.current = [{ x, y }, ...recentStartsRef.current].slice(0, 12);
  }, []);

  const spawnOneMeteor = useCallback(() => {
    const meteor = createMeteor({
      variant,
      recentStarts: recentStartsRef.current,
    });

    if (!meteor) return false;

    rememberStart(meteor.x0, meteor.y0);
    lastMotionAtRef.current = Date.now();

    setMeteors((prev) => {
      if (prev.length >= maxMeteors) return prev;
      return [...prev, meteor];
    });

    return true;
  }, [maxMeteors, rememberStart, variant]);

  const getSpawnDelay = useCallback(() => {
    const count = meteorsRef.current.length;

    if (count < MIN_ACTIVE) {
      return randomBetween(1_000, 2_000);
    }
    if (count < TARGET_ACTIVE) {
      return randomBetween(SPAWN_MIN_MS, 3_200);
    }
    return randomBetween(SPAWN_MIN_MS, SPAWN_MAX_MS);
  }, []);

  const scheduleNextSpawn = useCallback(() => {
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }

    spawnTimerRef.current = setTimeout(() => {
      if (meteorsRef.current.length < maxMeteors) {
        spawnOneMeteor();
      }
      scheduleNextSpawn();
    }, getSpawnDelay());
  }, [getSpawnDelay, maxMeteors, spawnOneMeteor]);

  useEffect(() => {
    meteorsRef.current = meteors;
    if (meteors.length > 0) {
      lastMotionAtRef.current = Date.now();
    }
  }, [meteors]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      setCursor({ x, y });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    spawnOneMeteor();
    setTimeout(() => spawnOneMeteor(), randomBetween(1_200, 2_400));

    scheduleNextSpawn();

    watchdogRef.current = setInterval(() => {
      const count = meteorsRef.current.length;
      const emptyFor = Date.now() - lastMotionAtRef.current;

      if (count < MIN_ACTIVE && emptyFor > 1_800) {
        spawnOneMeteor();
      }

      if (count === 0 && emptyFor >= MAX_EMPTY_MS) {
        spawnOneMeteor();
      }
    }, WATCHDOG_MS);

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (watchdogRef.current) clearInterval(watchdogRef.current);
    };
  }, [mounted, scheduleNextSpawn, spawnOneMeteor]);

  const removeMeteor = useCallback((id: string) => {
    setMeteors((prev) => prev.filter((meteor) => meteor.id !== id));
  }, []);

  const opacityScale = variant === "subtle" ? 0.55 : 1;

  const layers = useMemo<StarLayerConfig[]>(
    () =>
      LAYERS.map((layer, index) => ({
        id: index,
        parallax: layer.parallax * (variant === "subtle" ? 0.65 : 1),
        className: `studio-starfield__layer studio-starfield__layer--${index + 1}`,
        stars: buildLayerStars(
          index,
          layer.count,
          layer.opacityMin,
          layer.opacityMax,
          layer.sizeMax,
          opacityScale
        ),
      })),
    [opacityScale, variant]
  );

  if (!mounted) return null;

  return (
    <div className="studio-starfield" aria-hidden>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={layer.className}
          style={{
            transform: `translate3d(${cursor.x * layer.parallax}px, ${cursor.y * layer.parallax}px, 0)`,
          }}
        >
          {layer.stars.map((star) => (
            <span
              key={`${layer.id}-${star.id}`}
              className="studio-starfield__star"
              style={
                {
                  left: star.left,
                  top: star.top,
                  width: star.sizePx,
                  height: star.sizePx,
                  "--star-base-opacity": star.opacity,
                  "--star-delay": star.delay,
                  "--star-dur": star.duration,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}

      <div className="studio-starfield__meteors">
        {meteors.map((meteor) => (
          <span
            key={meteor.id}
            className="studio-starfield__meteor"
            onAnimationEnd={() => removeMeteor(meteor.id)}
            style={
              {
                "--meteor-length": `${meteor.lengthPx}px`,
                "--meteor-dur": `${meteor.durationMs}ms`,
                "--meteor-op": meteor.peakOpacity.toFixed(3),
                "--meteor-angle": `${meteor.angle.toFixed(2)}deg`,
                "--meteor-x0": meteor.x0,
                "--meteor-y0": meteor.y0,
                "--meteor-x2": meteor.x2,
                "--meteor-y2": meteor.y2,
              } as CSSProperties
            }
          >
            <span className="studio-starfield__meteor-tail" aria-hidden />
            <span className="studio-starfield__meteor-head" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
