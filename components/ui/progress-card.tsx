import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProgressCardProps = {
  /** 0–100, or `null` / omit for indeterminate / animated bar */
  progress?: number | null;
  status: string;
  substatus?: string;
  className?: string;
};

export function ProgressCard({
  progress = null,
  status,
  substatus,
  className,
}: ProgressCardProps) {
  const determinate =
    typeof progress === "number" && !Number.isNaN(progress);
  const width = determinate
    ? `${Math.min(100, Math.max(0, progress))}%`
    : undefined;

  return (
    <Card
      className={cn(
        "w-full max-w-md border-primary/15 bg-card/50 p-6 text-center transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_20px_50px_-24px_rgb(139_92_246/0.35)]",
        className
      )}
    >
      <p className="text-sm font-medium text-foreground">{status}</p>
      {substatus ? (
        <p className="mt-1 text-xs text-muted-foreground">{substatus}</p>
      ) : null}

      <div
        className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted/80"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={determinate ? progress! : undefined}
        aria-label={status}
      >
        {determinate ? (
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width }}
          />
        ) : (
          <div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 motion-reduce:w-full motion-reduce:animate-none"
            style={{
              animation: "border-shimmer 1.8s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </div>
    </Card>
  );
}
