import { cn } from "@/lib/utils";

interface CityImagePlaceholderProps {
  place?: string;
  className?: string;
  label?: string;
}

/** Calm editorial placeholder — no «Фото скоро». */
export function CityImagePlaceholder({
  place,
  className,
  label = "Иркутск",
}: CityImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        "bg-[linear-gradient(145deg,var(--color-city-stone)_0%,var(--color-city-paper)_45%,var(--color-city-stone)_100%)]",
        "city-texture-pattern",
        className
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <span className="font-serif text-lg text-city-muted/50 italic">
          {label}
        </span>
        {place && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-city-muted/40">
            {place}
          </span>
        )}
      </div>
    </div>
  );
}
