"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Article = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  readTime?: number;
  isHiddenGem?: boolean;
};

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/explore/${article.slug}`}
      className="group flex flex-col"
      aria-label={article.title}
    >
      <div className="img-reveal relative aspect-[3/2] overflow-hidden bg-muted mb-4">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
        {article.isHiddenGem && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="ice" className="text-xs">
              Hidden gem
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {article.category}
          {article.readTime && ` · ${article.readTime} мин`}
        </p>
        <h3 className="text-base font-medium leading-snug text-foreground group-hover:text-baikal transition-colors duration-200 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}

export function ExplorePreview({ articles }: { articles?: Article[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const items = articles ?? [];

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced || items.length === 0) return;

      gsap.from(".explore-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".explore-header",
          start: "top 85%",
        },
      });

      gsap.from(".explore-card", {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".explore-grid",
          start: "top 80%",
        },
      });
    },
    { scope: sectionRef, dependencies: [items.length] }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36"
      aria-labelledby="explore-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="explore-header flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Медиа
            </p>
            <h2
              id="explore-heading"
              className="text-4xl lg:text-5xl font-light tracking-tight text-foreground"
            >
              Исследовать <span className="font-serif italic">Иркутск</span>
            </h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group shrink-0"
          >
            Все заметки
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border">
            <p className="text-muted-foreground mb-4">
              Материалы появятся после публикации статей в CMS
            </p>
            <Link href="/explore" className="text-sm text-baikal hover:underline">
              Раздел «Исследовать»
            </Link>
          </div>
        ) : (
          <div className="explore-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((article) => (
              <div key={article.id} className="explore-card">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
