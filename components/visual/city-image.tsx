import Image from "next/image";
import { cn } from "@/lib/utils";
import { CityImagePlaceholder } from "./city-image-placeholder";

export type CityImageAspectRatio =
  | "16/10"
  | "4/3"
  | "3/4"
  | "16/9"
  | "video"
  | "square"
  | "auto";

const ASPECT_CLASSES: Record<CityImageAspectRatio, string> = {
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-[16/9]",
  video: "aspect-video",
  square: "aspect-square",
  auto: "",
};

export type CityImageProps = {
  src?: string | null;
  alt: string;
  caption?: string;
  credit?: string;
  sourceLabel?: string;
  year?: string | number;
  place?: string;
  aspectRatio?: CityImageAspectRatio;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  captionClassName?: string;
  showPlaceholder?: boolean;
  rounded?: boolean;
  overlay?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
};

function formatMetaLine(
  year?: string | number,
  place?: string
): string | undefined {
  const parts: string[] = [];
  if (year) parts.push(String(year));
  if (place) parts.push(place);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function CityImage({
  src,
  alt,
  caption,
  credit,
  sourceLabel,
  year,
  place,
  aspectRatio = "16/10",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className,
  imageClassName,
  captionClassName,
  showPlaceholder = true,
  rounded = false,
  overlay = false,
  fill = true,
  width,
  height,
}: CityImageProps) {
  const hasImage = Boolean(src);
  const metaLine = formatMetaLine(year, place);
  const hasCaptionBlock = Boolean(caption || credit || sourceLabel || metaLine);

  return (
    <figure
      className={cn(
        "relative overflow-hidden",
        ASPECT_CLASSES[aspectRatio],
        rounded && "rounded-[var(--radius-card)]",
        className
      )}
    >
      {hasImage ? (
        <Image
          src={src!}
          alt={alt}
          fill={fill && !width}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover",
            fill && "absolute inset-0 h-full w-full",
            imageClassName
          )}
        />
      ) : showPlaceholder ? (
        <CityImagePlaceholder place={place} />
      ) : null}

      {overlay && hasImage && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--image-overlay-soft)" }}
          aria-hidden
        />
      )}

      {hasCaptionBlock && (
        <figcaption
          className={cn(
            overlay
              ? "absolute bottom-0 left-0 right-0 z-10 px-4 py-3 text-primary-foreground"
              : "mt-2 space-y-0.5",
            captionClassName
          )}
        >
          {caption && (
            <p
              className={cn(
                "text-sm leading-snug",
                overlay ? "text-primary-foreground/95" : "text-foreground"
              )}
            >
              {caption}
            </p>
          )}
          {metaLine && (
            <p
              className={cn(
                "text-xs",
                overlay
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {metaLine}
            </p>
          )}
          {(credit || sourceLabel) && (
            <p
              className={cn(
                "text-[11px]",
                overlay
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground/80"
              )}
            >
              {[credit, sourceLabel].filter(Boolean).join(" · ")}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/** Alias for editorial contexts. */
export const EditorialImage = CityImage;
