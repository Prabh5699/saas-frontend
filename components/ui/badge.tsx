import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default:
    "border-border/60 bg-muted/50 text-muted-foreground",
  processing:
    "border-amber-500/25 bg-amber-500/10 text-amber-200/95 ring-1 ring-amber-500/15",
  done:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/95 ring-1 ring-emerald-500/15",
  failed:
    "border-red-500/30 bg-red-500/10 text-red-200/95 ring-1 ring-red-500/15",
} as const;

export type BadgeVariant = keyof typeof variants;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
