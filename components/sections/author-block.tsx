"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand-constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type AuthorBlockProps = {
  name?: string;
  role?: string;
  shortText?: string;
  photoUrl?: string;
};

export function AuthorBlock({
  name = BRAND.authorName,
  role = BRAND.authorRole,
  shortText = BRAND.authorShortText,
  photoUrl,
}: AuthorBlockProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".author-image", {
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".author-image", start: "top 80%" },
      });

      gsap.from(".author-text > *", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".author-text",
          start: "top 80%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36 bg-card"
      aria-labelledby="author-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="author-image relative aspect-[3/4] overflow-hidden bg-muted">
            <Image
              src={photoUrl || "/images/founder-portrait.svg"}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="author-text flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Кто показывает вам Иркутск
            </p>

            <h2
              id="author-heading"
              className="text-3xl lg:text-4xl font-light tracking-tight text-foreground"
            >
              {name}
            </h2>

            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {role}
            </p>

            <p className="text-muted-foreground leading-relaxed">{shortText}</p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center gap-2 px-6 text-sm font-medium bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors group"
              >
                О проекте
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center px-6 text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Написать / Спланировать
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
