import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PrelaunchState } from "@/components/prelaunch/prelaunch-state";
import { isPublicPublishedReady } from "@/lib/content-readiness";
import { BRAND } from "@/lib/brand-constants";

export const metadata: Metadata = {
  title: "Гиды — Иркпортал",
  description:
    "Авторы маршрутов и экскурсий Иркпортала. Профили публикуются после редакционной подготовки.",
};

const SPEC_LABELS: Record<string, string> = {
  history: "История",
  architecture: "Архитектура",
  gastronomy: "Гастрономия",
  wooden: "Деревянное зодчество",
  baikal: "Байкал",
  night: "Ночные прогулки",
  decembrists: "Декабристы",
  hidden: "Секретные места",
  corporate: "Корпоративные",
};

type Guide = {
  id: string;
  name: string;
  slug: string;
  photo?: { url?: string; alt?: string };
  specialization?: string[];
  bio: string;
  quote?: string;
  experience?: number;
  languages?: Array<{ language: string }>;
  isActive?: boolean;
};

async function getGuides(): Promise<Guide[]> {
  try {
    if (!process.env.DATABASE_URL) return [];
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "guides",
      where: { isActive: { equals: true } },
      sort: "order",
      limit: 20,
      depth: 1,
    });
    return (result.docs as unknown as Guide[]).filter((g) =>
      isPublicPublishedReady({
        kind: "guide",
        name: g.name,
        slug: g.slug,
        isActive: true,
        altTexts: [g.photo?.alt],
        mediaUrls: [g.photo?.url],
      })
    );
  } catch {
    return [];
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <main className="pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={12} />
          О проекте
        </Link>

        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Команда
          </p>
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            Наши <span className="font-serif italic">гиды</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
            Автор проекта — {BRAND.authorName}. Дополнительные профили гидов
            появятся здесь после публикации в CMS.
          </p>
        </div>

        {guides.length === 0 ? (
          <PrelaunchState surface="guides" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {guides.map((guide) => (
              <div key={guide.id} className="flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-6 grayscale hover:grayscale-0 transition-all duration-500">
                  {guide.photo?.url ? (
                    <Image
                      src={guide.photo.url}
                      alt={guide.photo.alt || guide.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                      <span className="text-6xl font-serif">{guide.name[0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-xl font-medium text-foreground">
                      {guide.name}
                    </h2>
                    {guide.experience ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {guide.experience}{" "}
                        {guide.experience === 1
                          ? "год"
                          : guide.experience < 5
                            ? "года"
                            : "лет"}{" "}
                        опыта
                      </p>
                    ) : null}
                  </div>

                  {guide.quote ? (
                    <p className="text-sm font-serif italic text-muted-foreground leading-relaxed border-l-2 border-baikal/30 pl-3">
                      «{guide.quote}»
                    </p>
                  ) : null}

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {guide.bio}
                  </p>

                  {guide.specialization && guide.specialization.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {guide.specialization.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {SPEC_LABELS[spec] || spec}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {guide.languages && guide.languages.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {guide.languages.map((l) => l.language).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 border-t border-border pt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-lg font-medium mb-2">
              Хотите присоединиться к команде?
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Если вы знаете Иркутск и хотите вести авторские экскурсии —
              напишите нам.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-11 min-h-[44px] items-center gap-2 bg-foreground text-primary-foreground px-7 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 group shrink-0"
          >
            Написать нам
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
