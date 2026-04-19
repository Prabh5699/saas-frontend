import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "clickable";
};

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/30 text-card-foreground shadow-xl backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300",
        variant === "clickable" &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-2xl active:translate-y-0 motion-reduce:hover:translate-y-0",
        className
      )}
      {...props}
    />
  );
}
