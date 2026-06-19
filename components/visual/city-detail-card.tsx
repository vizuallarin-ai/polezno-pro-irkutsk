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
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
          {meta}
        </p>
      )}
      <h3 className="text-base font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
