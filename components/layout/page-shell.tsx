import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type PageShellProps = HTMLAttributes<HTMLDivElement>;

/** Standard max-width + horizontal padding for app pages. */
export function PageShell({ className, ...props }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8",
        className
      )}
      {...props}
    />
  );
}
