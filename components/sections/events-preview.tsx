"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Event = {
  id: string;
  title: string;
  date: string;
  dateEnd?: string;
  venue: string;
  category: string;
  slug: string;
  ticketUrl?: string;
};

const fallbackEvents: Event[] = [
  {
    id: "1",
    title: "Байкальский зимний марафон",
    date: "2026-02-08",
    venue: "Байкал, Листвянка",
    category: "Спорт",
    slug: "baikal-marathon",
  },
  {
    id: "2",
    title: "Фестиваль деревянного зодчества",
    date: "2026-06-14",
    dateEnd: "2026-06-16",
    venue: "130-й квартал",
    category: "Культура",
    slug: "wooden-festival",
    ticketUrl: "#",
  },
  {
    id: "3",
    title: "Открытие ресторанной недели",
    date: "2026-07-01",
    dateEnd: "2026-07-07",
    venue: "Рестораны города",
    category: "Гастрономия",
    slug: "restaurant-week",
  },
  {
    id: "4",
    title: "Выставка «Иркутск: 360 лет»",
    date: "2026-07-20",
    venue: "Краеведческий музей",
    category: "Выставка",
    slug: "irkutsk-360",
    ticketUrl: "#",
  },
  {
    id: "5",
    title: "Гастрольный концерт «Сибирский джаз»",
    date: "2026-08-03",
    venue: "Иркутская филармония",
    category: "Концерт",
    slug: "siberian-jazz",
    ticketUrl: "#",
  },
  {
    id: "6",
    title: "Форум байкальского туризма",
    date: "2026-09-15",
    dateEnd: "2026-09-17",
    venue: "ИГУ, конференц-зал",
    category: "Форум",
    slug: "baikal-tourism-forum",
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("ru-RU", { day: "numeric" }),
    month: d.toLocaleDateString("ru-RU", { month: "short" }),
  };
}

export function EventsPreview({ events }: { events?: Event[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const items = events ?? fallbackEvents;

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".events-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".events-header", start: "top 85%" },
      });

      gsap.from(".event-row", {
        opacity: 0,
        x: -20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".events-list",
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
      aria-labelledby="events-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="events-header flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Ближайшие события
            </p>
            <h2
              id="events-heading"
              className="text-4xl lg:text-5xl font-light tracking-tight text-foreground"
            >
              Что происходит <br />
              <span className="font-serif italic">в Иркутске</span>
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group shrink-0"
          >
            Все события
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="events-list">
          {items.map((event, i) => {
            const { day, month } = formatDateShort(event.date);
            return (
              <div key={event.id}>
                {i > 0 && <Separator className="my-0" />}
                <Link
                  href={`/events/${event.slug}`}
                  className="event-row group flex items-center gap-6 py-6 hover:bg-background -mx-6 px-6 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center w-12 shrink-0 text-center">
                    <span className="text-2xl font-light tabular-nums leading-none">
                      {day}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                      {month}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      {event.category}
                    </p>
                    <p className="font-medium text-foreground leading-snug group-hover:text-baikal transition-colors duration-200 line-clamp-1">
                      {event.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.venue}
                    </p>
                  </div>

                  {event.ticketUrl && (
                    <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground border border-border px-3 py-1.5 group-hover:border-foreground group-hover:text-foreground transition-colors duration-200">
                      Билеты
                    </span>
                  )}

                  <ArrowRight
                    size={14}
                    className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

