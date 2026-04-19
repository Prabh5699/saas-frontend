/**
 * Theme-aware base: parent should use `bg-background`. These layers add the cinematic gradient / grid / noise on top.
 */
export function CinematicBackdrop() {
  const noiseDataUrl =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

  return (
    <>
      <div
        className="pointer-events-none absolute -left-[20%] -top-[10%] h-[min(90vw,720px)] w-[min(90vw,720px)] rounded-full bg-violet-600/25 blur-[140px] motion-reduce:opacity-40"
        style={{ animation: "aurora-shift 20s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -bottom-[15%] -right-[15%] h-[min(85vw,640px)] w-[min(85vw,640px)] rounded-full bg-fuchsia-600/20 blur-[130px] motion-reduce:opacity-40"
        style={{ animation: "aurora-shift 24s ease-in-out infinite reverse" }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[110px] motion-reduce:opacity-30"
        style={{ animation: "aurora-shift 28s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/5 opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(139 92 246 / 0.18), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.055) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 45%, black 15%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: noiseDataUrl }}
        aria-hidden
      />
    </>
  );
}
