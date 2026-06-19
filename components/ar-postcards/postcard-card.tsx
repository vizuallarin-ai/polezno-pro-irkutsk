import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { effectTypeLabel } from "@/lib/ar-postcard-adapter";
import type { PublicArPostcard } from "@/types/ar-postcards";

interface PostcardCardProps {
  postcard: PublicArPostcard;
}

export function PostcardCard({ postcard }: PostcardCardProps) {
  const image =
    postcard.coverImageUrl ||
    postcard.postcardImageUrl ||
    "/images/map-preview.svg";

  return (
    <Link
      href={`/ar-postcards/${postcard.slug}`}
      className="group flex flex-col border border-border bg-background hover:border-foreground/20 transition-colors"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={image}
          alt={postcard.coverImageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {postcard.isFeatured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-city-ink/80 text-white text-[10px] uppercase tracking-widest px-2 py-1">
            <Sparkles size={10} />
            Витрина
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {effectTypeLabel(postcard.effectType)}
        </p>
        <h3 className="text-sm font-medium leading-snug group-hover:text-baikal transition-colors">
          {postcard.title}
        </h3>
        {postcard.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {postcard.shortDescription}
          </p>
        )}
        {(postcard.place || postcard.year) && (
          <p className="text-[11px] text-muted-foreground mt-auto">
            {[postcard.place, postcard.year].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
