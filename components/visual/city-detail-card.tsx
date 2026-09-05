import { cn } from "@/lib/utils";

interface CityDetailCardProps {
  title: string;
  description?: string;
  meta?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Small editorial detail block — one city fact per card. */
export function CityDetailCard({
  title,
  description,
  meta,
  className,
  children,
}: CityDetailCardProps) {
  return (
    <div
      className={cn(
        "border border-border bg-card p-5 lg:p-6 city-card",
        className
      )}
    >
      {meta && (
        <p className="type-eyebrow text-muted-foreground mb-2">
          {meta}
        </p>
      )}
      <h3 className="type-h3 text-foreground mb-2">{title}</h3>
      {description && (
        <p className="type-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
