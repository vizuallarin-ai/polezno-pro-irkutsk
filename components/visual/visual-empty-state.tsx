import Link from "next/link";
import { cn } from "@/lib/utils";

interface VisualEmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function VisualEmptyState({
  message,
  actionLabel,
  actionHref,
  className,
}: VisualEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center gap-4",
        "border border-dashed border-border bg-card/50 px-6",
        className
      )}
    >
      <p className="text-muted-foreground max-w-md leading-relaxed">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-sm text-baikal hover:underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
