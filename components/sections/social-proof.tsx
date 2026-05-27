"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Stat = { value: string; label: string };
export type Review = {
  id: string;
  text: string;
  author: string;
  city?: string;
  photo?: { url?: string };
};

const DEFAULT_STATS: Stat[] = [
  { value: "500+", label: "туристов в год" },
  { value: "8", label: "авторских маршрутов" },
  { value: "50+", label: "корпоративных программ" },
  { value: "5", label: "лет в Иркутске" },
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "1",
    text: "Приехали на 3 дня — остались на неделю. Маршруты составлены с такой любовью к городу, что начинаешь видеть его другими глазами.",
    author: "Мария К.",
    city: "Москва",
  },
  {
    id: "2",
    text: "Корпоративная программа для 40 человек была организована безупречно. Все участники были в восторге от уровня подготовки и атмосферы.",
    author: "Дмитрий В.",
    city: "Новосибирск",
  },
  {
    id: "3",
    text: "Экскурсия по деревянному зодчеству — лучшее, что я делал в Иркутске. Гид знает каждый дом и каждую историю за ним.",
    author: "Анна Л.",
    city: "Санкт-Петербург",
  },
];

interface SocialProofProps {
  stats?: Stat[];
  reviews?: Review[];
}

export function SocialProof({
  stats = DEFAULT_STATS,
  reviews = DEFAULT_REVIEWS,
}: SocialProofProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".stat-item", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".stats-row", start: "top 85%" },
      });

      gsap.from(".review-card", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".reviews-grid", start: "top 80%" },
      });
    },
    { scope: sectionRef }
  );

  const displayStats = stats.length > 0 ? stats : DEFAULT_STATS;
  const displayReviews = reviews.length > 0 ? reviews : DEFAULT_REVIEWS;

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36"
      aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-12">
          Нам доверяют
        </p>

        <div className="stats-row grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-20 lg:mb-28">
          {displayStats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <p className="text-4xl lg:text-5xl font-light tabular-nums tracking-tight text-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="reviews-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((review) => (
            <figure
              key={review.id}
              className="review-card flex flex-col gap-4 border border-border p-6"
            >
              <blockquote className="text-sm leading-relaxed text-foreground flex-1">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-border">
                {review.photo?.url ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={review.photo.url}
                      alt={review.author}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {review.author[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{review.author}</p>
                  {review.city && (
                    <p className="text-xs text-muted-foreground">{review.city}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
