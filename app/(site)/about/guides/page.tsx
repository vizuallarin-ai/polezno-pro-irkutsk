import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Наши гиды — авторы маршрутов «Полезно про Иркутск»",
  description:
    "Авторы экскурсий и маршрутов по Иркутску. Историки, архитекторы, гастрономы — люди, которые знают город изнутри.",
};

const SPEC_LABELS: Record<string, string> = {
  history: "История",
  architecture: "Архитектура",
  gastronomy: "Гастрономия",
  wooden: "Деревянное зодчество",
  baikal: "Байкал",
  night: "Ночные прогулки",
  decembrists: "Декабристы",
  hidden: "Hidden Places",
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
};

async function getGuides(): Promise<Guide[]> {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "guides",
      where: { isActive: { equals: true } },
      sort: "order",
      limit: 20,
      depth: 1,
    });
    return result.docs as unknown as Guide[];
  } catch {
    return [];
  }
}

const FALLBACK_GUIDES: Guide[] = [
  {
    id: "1",
    name: "Имя Гида",
    slug: "guide-1",
    bio: "Историк, краевед, автор маршрутов по деревянному зодчеству Иркутска. Знает каждый дом и каждую историю за ним.",
    quote: "Иркутск — это не город, это книга. Я просто помогаю её читать.",
    experience: 8,
    specialization: ["wooden", "history", "decembrists"],
    languages: [{ language: "Русский" }, { language: "English" }],
  },
];

export default async function GuidesPage() {
  const guides = await getGuides();
  const displayGuides = guides.length > 0 ? guides : FALLBACK_GUIDES;

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
            Историки, архитекторы, гастрономы и просто люди, которые знают
            Иркутск изнутри. Каждый маршрут — авторский.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {displayGuides.map((guide) => (
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
                  {guide.experience && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {guide.experience}{" "}
                      {guide.experience === 1
                        ? "год"
                        : guide.experience < 5
                        ? "года"
                        : "лет"}{" "}
                      опыта
                    </p>
                  )}
                </div>

                {guide.quote && (
                  <p className="text-sm font-serif italic text-muted-foreground leading-relaxed border-l-2 border-baikal/30 pl-3">
                    «{guide.quote}»
                  </p>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {guide.bio}
                </p>

                {guide.specialization && guide.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {guide.specialization.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {SPEC_LABELS[spec] || spec}
                      </Badge>
                    ))}
                  </div>
                )}

                {guide.languages && guide.languages.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {guide.languages.map((l) => l.language).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

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
            className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-7 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 group shrink-0"
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
