import { cn } from "@/lib/utils";

interface CityTextureDividerProps {
  className?: string;
}

export function CityTextureDivider({ className }: CityTextureDividerProps) {
  return (
    <div
      className={cn("city-texture-divider w-full", className)}
      role="separator"
      aria-hidden
    />
  );
}
