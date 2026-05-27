import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Исследовать Иркутск — гид по городу и Байкалу",
  description:
    "Что посмотреть, где поесть, где остановиться в Иркутске. Статьи, маршруты и рекомендации от местных жителей.",
};

const categories = [
  {
    slug: "sights",
    label: "Что посмотреть",
    description: "Достопримечательности, музеи и обязательные места",
    image: "/images/explore-sights.jpg",
  },
  {
    slug: "walks",
    label: "Где гулять",
    description: "Набережные, парки и пешеходные маршруты",
    image: "/images/explore-walks.jpg",
  },
  {
    slug: "food",
    label: "Где поесть",
    description: "Рестораны, кафе, рынки и гастрономия Иркутска",
    image: "/images/explore-food.jpg",
  },
  {
    slug: "stay",
    label: "Где остановиться",
    description: "Отели, хостелы и апартаменты с характером",
    image: "/images/explore-stay.jpg",
  },
  {
    slug: "history",
    label: "История города",
    description: "От казачьего острога до культурной столицы Сибири",
    image: "/images/explore-history.jpg",
  },
  {
    slug: "baikal",
    label: "Байкал рядом",
    description: "Что и как смотреть на Байкале из Иркутска",
    image: "/images/explore-baikal.jpg",
  },
  {
    slug: "hidden",
    label: "Hidden Places",
    description: "Места, которые знают только местные",
    image: "/images/explore-hidden.jpg",
  },
  {
    slug: "facts",
    label: "Интересные факты",
    description: "Неочевидное об Иркутске",
    image: "/images/explore-facts.jpg",
  },
];

async function getAllArticles() {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      limit: 12,
      sort: "-publishedAt",
    });
    return result.docs;
  } catch {
    return [];
  }
}

export default async function ExplorePage() {
  const articles = await getAllArticles();

  return (
    <main className="pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Digital travel magazine
          </p>
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            Исследовать <span className="font-serif italic">Иркутск</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border mb-24">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore/${cat.slug}`}
              className="group relative aspect-square overflow-hidden bg-background hover:z-10"
              aria-label={cat.label}
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {cat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {articles.length > 0 && (
          <div>
            <h2 className="text-2xl font-light tracking-tight mb-10">
              Последние материалы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/explore/${article.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
                    {article.coverImage &&
                      typeof article.coverImage === "object" &&
                      "url" in article.coverImage && (
                        <Image
                          src={article.coverImage.url as string}
                          alt={
                            (article.coverImage as { alt?: string }).alt ||
                            String(article.title)
                          }
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      )}
                    {article.isHiddenGem && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="ice">Hidden gem</Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {String(article.category)}
                    {article.readTime ? ` · ${article.readTime} мин` : ""}
                  </p>
                  <h3 className="text-base font-medium leading-snug text-foreground group-hover:text-baikal transition-colors duration-200">
                    {String(article.title)}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {String(article.excerpt)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
