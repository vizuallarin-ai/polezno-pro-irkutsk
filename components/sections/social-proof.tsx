"use client";

import { useRef } from "react";
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

const GUEST_HIGHLIGHTS = [
  "Маршруты без «топ-10» и сувенирных штампов",
  "Живые истории за фасадами деревянных домов",
  "Программы под даты, темп и состав группы",
  "Материалы о городе, которые остаются после визита",
];

interface SocialProofProps {
  stats?: Stat[];
  reviews?: Review[];
}

export function SocialProof({
  stats,
  reviews,
}: SocialProofProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const hasReviews = reviews && reviews.length > 0;
  const displayStats = stats && stats.length > 0 ? stats : [];

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

      gsap.from(".highlight-item", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".highlights-grid", start: "top 80%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36"
      aria-labelledby="social-proof-heading"
      id="trust"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          id="social-proof-heading"
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-12"
        >
          {hasReviews ? "Отзывы гостей" : "Что обычно отмечают гости"}
        </h2>

        <div
          className={
            displayStats.length > 0
              ? "stats-row grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16 lg:mb-20"
              : "hidden"
          }
        >
          {displayStats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <p className="text-4xl lg:text-5xl font-light tabular-nums tracking-tight text-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {hasReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <figure
                key={review.id}
                className="flex flex-col gap-4 border border-border p-6"
              >
                <blockquote className="text-sm leading-relaxed text-foreground flex-1">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="pt-4 border-t border-border">
                  <p className="text-sm font-medium">{review.author}</p>
                  {review.city && (
                    <p className="text-xs text-muted-foreground">{review.city}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <ul className="highlights-grid grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {GUEST_HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="highlight-item flex items-start gap-3 text-sm text-muted-foreground leading-relaxed border border-border p-4"
              >
                <span className="text-baikal mt-0.5" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
