"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AboutManifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".manifesto-image", {
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".manifesto-image", start: "top 80%" },
      });

      gsap.from(".manifesto-text > *", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".manifesto-text",
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
      aria-labelledby="manifesto-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="manifesto-image relative aspect-[3/4] overflow-hidden bg-muted">
            <Image
              src="/images/founder-portrait.svg"
              alt="Основатель проекта «Полезно про Иркутск»"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="manifesto-text flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              О проекте
            </p>

            <h2
              id="manifesto-heading"
              className="text-4xl lg:text-5xl font-serif font-light italic leading-[1.15] tracking-tight text-foreground"
            >
              «Иркутск — это город, который меняет тех, кто в нём остаётся»
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Мы начали этот проект, потому что устали видеть, как Иркутск
              проходят мимо. Туристы приезжают, ставят галочку возле Байкала
              и уезжают. Но город — это не Байкал. Это деревянные дома с резными
              наличниками, трамваи, дворы-проходняки, запах смолы и кедра,
              история декабристов и советских авангардистов.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              «Полезно про Иркутск» — это попытка показать город таким, каким
              его знаем мы: живым, слоёным, умным и очень красивым.
            </p>

            <div className="flex items-center gap-6 pt-4 border-t border-border">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Основатель
                </p>
                <p className="font-medium text-foreground">Имя Основателя</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  С нами с
                </p>
                <p className="font-medium text-foreground">2019 года</p>
              </div>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground group w-fit mt-2"
            >
              Читать манифест
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

