import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { StudioAmbientField } from "@/components/layout/studio-ambient-field";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LenePageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Shared cinematic shell for home, login, signup — matches Image Studio atmosphere. */
export function LenePageShell({ children, className }: LenePageShellProps) {
  return (
    <div
      className={cn(
        "studio-page font-sans relative h-dvh min-h-dvh overflow-hidden text-[#e8eeff]",
        className
      )}
      style={{
        background:
          "linear-gradient(165deg, #030508 0%, #060a1a 35%, #0a1028 65%, #06091a 100%)",
      }}
    >
      <CinematicBackdrop />
      <div className="studio-orb studio-orb--violet" aria-hidden />
      <div className="studio-orb studio-orb--cyan" aria-hidden />
      <div className="studio-orb studio-orb--rose" aria-hidden />
      <StudioAmbientField />
      <div className="studio-hero-anchors" aria-hidden>
        <div className="studio-hero-anchors__glow" />
        <div className="studio-hero-anchors__cluster studio-hero-anchors__cluster--a" />
        <div className="studio-hero-anchors__cluster studio-hero-anchors__cluster--b" />
        <div className="studio-hero-anchors__cluster studio-hero-anchors__cluster--c" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -10%, rgba(139,92,246,0.18) 0%, transparent 55%),
            linear-gradient(180deg, transparent 0%, rgba(6,10,26,0.35) 88%, rgba(3,5,12,0.9) 100%)
          `,
        }}
      />
      <div className="relative z-10 h-full min-h-0">{children}</div>
    </div>
  );
}
