"use client";

import { memo } from "react";

type StudioGenerationLoaderProps = {
  progress: number | null;
  status: string;
  substatus?: string;
  sceneCompleted?: number;
  sceneTotal?: number;
  variant?: "images" | "video";
};

function StudioGenerationLoaderInner({
  progress,
  status,
  substatus,
  sceneCompleted,
  sceneTotal,
  variant = "images",
}: StudioGenerationLoaderProps) {
  const determinate =
    typeof progress === "number" && !Number.isNaN(progress);
  const pct = determinate
    ? Math.min(100, Math.max(0, Math.round(progress)))
    : null;

  const sceneLabel =
    sceneTotal != null &&
    sceneTotal > 0 &&
    sceneCompleted != null &&
    variant === "images"
      ? `${sceneCompleted} of ${sceneTotal} scenes ready`
      : null;

  return (
    <div
      className="studio-gen-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: "absolute",
        inset: 12,
        zIndex: 4,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 18px",
        background:
          "linear-gradient(160deg, rgba(15,23,42,0.88) 0%, rgba(30,27,75,0.82) 50%, rgba(6,10,26,0.92) 100%)",
        backdropFilter: "blur(20px) saturate(1.2)",
        WebkitBackdropFilter: "blur(20px) saturate(1.2)",
        border: "1px solid rgba(129,140,248,0.22)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 48px -12px rgba(99,102,241,0.35)",
      }}
    >
      <div
        className="studio-gen-glow"
        aria-hidden
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            variant === "video"
              ? "radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="studio-gen-ring"
        aria-hidden
        style={{
          position: "relative",
          width: 52,
          height: 52,
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(129,140,248,0.15)",
          }}
        />
        <div
          className="studio-gen-ring-spin"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: variant === "video" ? "#38bdf8" : "#818cf8",
            borderRightColor: variant === "video" ? "#22d3ee" : "#a78bfa",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.15))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
          aria-hidden
        >
          {variant === "video" ? "▶" : "✦"}
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: "#e8eeff",
          textAlign: "center",
        }}
      >
        {status}
      </p>

      {substatus ? (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11,
            color: "rgba(148,163,220,0.7)",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {substatus}
        </p>
      ) : null}

      {sceneLabel ? (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "rgba(129,140,248,0.85)",
            textAlign: "center",
          }}
        >
          {sceneLabel}
        </p>
      ) : null}

      <div
        style={{
          width: "100%",
          maxWidth: 200,
          marginTop: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
            minHeight: 14,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(148,163,220,0.5)",
            }}
          >
            Progress
          </span>
          {pct != null ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: "#c7d2fe",
              }}
            >
              {pct}%
            </span>
          ) : (
            <span
              className="studio-gen-dots"
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "rgba(148,163,220,0.6)",
              }}
              aria-hidden
            >
              ···
            </span>
          )}
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct ?? undefined}
          aria-label={status}
          style={{
            height: 4,
            width: "100%",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          {pct != null ? (
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #6366f1, #818cf8, #38bdf8)",
                boxShadow: "0 0 12px rgba(99,102,241,0.6)",
                transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : (
            <div className="studio-gen-bar-indeterminate" />
          )}
        </div>
      </div>
    </div>
  );
}

export const StudioGenerationLoader = memo(StudioGenerationLoaderInner);
