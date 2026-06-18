import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MAKER_CRAFT_LABELS } from "@/lib/content-labels";
import type { SouvenirMaker } from "@/lib/souvenirs-types";

export function MakerCard({ maker }: { maker: SouvenirMaker }) {
  const imageUrl = maker.coverUrl || maker.avatarUrl;

  return (
    <Link
      href={`/souvenirs/makers/${maker.slug}`}
      className="group flex flex-col border border-border p-5 hover:bg-card transition-colors duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={maker.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 text-3xl font-serif">
            {maker.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {maker.craftLabel}
        </Badge>
        {maker.advertisingLabelNeeded && (
          <Badge variant="secondary" className="text-xs">
            Партнёр
          </Badge>
        )}
      </div>
      <p className="text-base font-medium mb-2 group-hover:text-baikal transition-colors">
        {maker.title}
      </p>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
        {maker.shortDescription}
      </p>
      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
        Смотреть
        <ArrowRight size={12} />
      </span>
    </Link>
  );
}

export function MakerChip({ maker }: { maker: SouvenirMaker }) {
  return (
    <Link
      href={`/souvenirs/makers/${maker.slug}`}
      className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm hover:bg-muted transition-colors"
    >
      {maker.avatarUrl && (
        <span className="relative w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0">
          <Image src={maker.avatarUrl} alt="" fill className="object-cover" sizes="24px" />
        </span>
      )}
      <span>{maker.title}</span>
      <span className="text-muted-foreground text-xs">
        {MAKER_CRAFT_LABELS[maker.craftType] || maker.craftType}
      </span>
    </Link>
  );
}
