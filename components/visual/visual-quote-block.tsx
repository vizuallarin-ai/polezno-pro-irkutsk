import { cn } from "@/lib/utils";

interface VisualQuoteBlockProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export function VisualQuoteBlock({
  quote,
  attribution,
  className,
}: VisualQuoteBlockProps) {
  return (
    <blockquote
      className={cn(
        "border-l-2 border-city-accent pl-6 py-2 my-8",
        className
      )}
    >
      <p className="font-serif text-xl lg:text-2xl font-light italic leading-relaxed text-foreground">
        {quote}
      </p>
      {attribution && (
        <footer className="mt-3 text-sm text-muted-foreground">
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}
