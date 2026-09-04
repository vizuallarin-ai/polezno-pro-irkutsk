"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface VisualEmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/** Lightweight empty — prefer PrelaunchState for full section architecture. */
export function VisualEmptyState({
  message,
  actionLabel,
  actionHref,
  className,
}: VisualEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 lg:py-20 text-center gap-5",
        "border border-border bg-card px-6",
        className
      )}
      role="status"
    >
      <p className="type-body text-muted-foreground max-w-md text-pretty">
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="cta-label type-button text-baikal hover:underline min-h-[44px] inline-flex items-center"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
