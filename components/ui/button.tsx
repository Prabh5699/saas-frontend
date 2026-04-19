import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100 active:scale-[0.99]";

const variants = {
  primary:
    "group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-sm text-white shadow-[0_12px_40px_-8px_rgb(139_92_246/0.55)] hover:brightness-110 hover:shadow-[0_16px_48px_-8px_rgb(139_92_246/0.45)]",
  secondary:
    "rounded-xl border border-border/80 bg-card/40 text-sm text-foreground backdrop-blur-sm hover:border-border hover:bg-card/60",
  outline:
    "rounded-xl border border-border bg-background/40 text-sm text-foreground backdrop-blur-sm hover:border-border hover:bg-background/60",
  ghost:
    "rounded-xl border border-transparent text-sm text-muted-foreground hover:text-foreground",
  heroPrimary:
    "group/btn relative flex w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-sm text-white shadow-[0_12px_40px_-8px_rgb(139_92_246/0.55)] hover:brightness-110 hover:shadow-[0_16px_48px_-8px_rgb(139_92_246/0.45)] focus-visible:ring-offset-background",
} as const;

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-sm",
  hero: "py-3.5 text-sm",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shine?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
  shine = true,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  shine?: boolean;
} = {}) {
  const v = variants[variant];
  const s =
    variant === "heroPrimary"
      ? sizes.hero
      : variant === "primary"
        ? sizes.md
        : sizes[size];
  return cn(
    base,
    v,
    s,
    shine &&
      (variant === "primary" || variant === "heroPrimary") &&
      "overflow-hidden",
    className
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  shine = true,
  loading = false,
  loadingLabel = "Loading…",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const showShine =
    shine &&
    (variant === "primary" || variant === "heroPrimary") &&
    !loading;
  const gradient =
    variant === "heroPrimary" || variant === "primary";

  const inner = loading ? (
    <>
      <Spinner
        className={variant === "heroPrimary" ? "h-5 w-5" : "h-4 w-4"}
      />
      {loadingLabel}
    </>
  ) : (
    children
  );

  return (
    <button
      className={buttonVariants({ variant, size, shine, className })}
      disabled={disabled ?? loading}
      {...props}
    >
      {gradient ? (
        <>
          <span className="relative z-10 flex items-center justify-center gap-2">
            {inner}
          </span>
          {showShine ? (
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition duration-700 group-hover/btn:translate-x-full motion-reduce:translate-x-0 motion-reduce:opacity-0"
              aria-hidden
            />
          ) : null}
        </>
      ) : (
        inner
      )}
    </button>
  );
}
