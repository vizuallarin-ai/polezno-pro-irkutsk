import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PublicArPostcard } from "@/types/ar-postcards";

interface RelatedArPostcardBlockProps {
  postcard: PublicArPostcard;
  variant?: "product" | "photo";
}

export function RelatedArPostcardBlock({
  postcard,
  variant = "product",
}: RelatedArPostcardBlockProps) {
  const title =
    variant === "photo"
      ? "Ожившая открытка по этому фото"
      : "Ожившая версия";

  const image =
    postcard.coverImageUrl ||
    postcard.postcardImageUrl ||
    "/images/map-preview.svg";

  return (
    <aside className="mt-12 pt-10 border-t border-border">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-baikal" />
        {title}
      </h2>
      <Link
        href={`/ar-postcards/${postcard.slug}`}
        className="group flex gap-4 items-start border border-border p-4 hover:bg-card transition-colors duration-200"
      >
        <div className="relative w-24 h-28 shrink-0 overflow-hidden bg-muted border border-border">
          <Image
            src={image}
            alt={postcard.coverImageAlt}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground group-hover:text-baikal transition-colors">
            {postcard.title}
          </p>
          {postcard.shortDescription && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {postcard.shortDescription}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Отсканируйте QR на открытке или откройте цифровую версию
          </p>
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted-foreground group-hover:text-baikal mt-1"
        />
      </Link>
    </aside>
  );
}
