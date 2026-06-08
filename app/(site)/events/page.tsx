import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Ticket } from "lucide-react";

export const metadata: Metadata = {
  title: "События в Иркутске — фестивали, концерты, выставки",
  description:
    "Календарь событий Иркутска: фестивали, концерты, выставки, ледовые события и гастрономические мероприятия.",
};

const CATEGORY_LABELS: Record<string, string> = {
  festival: "Фестивали",
  concert: "Концерты",
  exhibition: "Выставки",
  ice: "Лёд",
  baikal: "Байкал",
  gastronomy: "Гастрономия",
  sport: "Спорт",
  culture: "Культура",
  forum: "Форумы",
  other: "Другое",
};

async function getEvents() {
  try {
    if (!process.env.DATABASE_URL) return { upcoming: [], past: [] };
    const { getPayloadClient } = await import("@/lib/payload");
    const { upcomingEventsWhere, pastEventsWhere } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();

    const [upcomingRes, pastRes] = await Promise.all([
      payload.find({
        collection: "events",
        where: upcomingEventsWhere(),
        limit: 50,
        sort: "startDate",
        depth: 1,
      }),
      payload.find({
        collection: "events",
        where: pastEventsWhere(),
        limit: 20,
        sort: "-startDate",
        depth: 1,
      }),
    ]);

    return { upcoming: upcomingRes.docs, past: pastRes.docs };
  } catch {
    return { upcoming: [], past: [] };
  }
}

function formatEventDate(startDate: string, endDate?: string | null) {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  };

  if (!endDate) {
    return start.toLocaleDateString("ru-RU", options);
  }

  const end = new Date(endDate);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.toLocaleDateString("ru-RU", options)}`;
  }

  return `${start.toLocaleDateString("ru-RU", options)} — ${end.toLocaleDateString("ru-RU", options)}`;
}

function EventRow({
  event,
}: {
  event: {
    id: string | number;
    slug: string;
    title: string;
    category: string;
    startDate: string;
    endDate?: string | null;
    venue: string;
    address?: string | null;
    description?: string | null;
    price?: string | null;
    ticketUrl?: string | null;
    isFeatured?: boolean | null;
    coverImage?: { url?: string; alt?: string } | null;
  };
}) {
  const cover = event.coverImage as { url?: string; alt?: string } | undefined;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-6 items-start py-8 border-b border-border hover:bg-card -mx-6 px-6 transition-colors duration-200"
    >
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground text-base">
          {formatEventDate(
            String(event.startDate),
            event.endDate ? String(event.endDate) : undefined
          )}
        </p>
      </div>

      <div className="flex gap-5">
        {cover?.url && (
          <div className="relative w-20 h-20 shrink-0 overflow-hidden bg-muted hidden sm:block">
            <Image
              src={cover.url}
              alt={cover.alt || String(event.title)}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {CATEGORY_LABELS[String(event.category)] || String(event.category)}
            </Badge>
            {event.isFeatured && (
              <Badge variant="baikal" className="text-xs">
                Рекомендуем
              </Badge>
            )}
          </div>
          <h2 className="font-medium text-foreground group-hover:text-baikal transition-colors duration-200 leading-snug mb-2">
            {String(event.title)}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0" />
            {String(event.venue)}
            {event.address && ` · ${event.address}`}
          </p>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {String(event.description)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:flex-col md:items-end">
        {event.price && (
          <p className="text-sm font-medium text-foreground">{String(event.price)}</p>
        )}
        {event.ticketUrl && (
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest border border-border px-3 py-2 group-hover:border-foreground group-hover:text-foreground transition-colors duration-200">
            <Ticket size={11} />
            Билеты
          </span>
        )}
        <ArrowRight
          size={14}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
        />
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();
  const hasAny = upcoming.length > 0 || past.length > 0;

  return (
    <main className="pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Событийный Иркутск
          </p>
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            Что происходит <span className="font-serif italic">в городе</span>
          </h1>
        </div>

        {!hasAny ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Скоро здесь появятся ближайшие события
            </p>
            <Link href="/contact" className="text-sm text-baikal hover:underline">
              Хотите анонсировать событие?
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-16">
                <h2 className="text-xl font-light mb-6">Ближайшие</h2>
                <div className="flex flex-col gap-0">
                  {upcoming.map((event) => (
                    <EventRow key={event.id} event={event as never} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-xl font-light mb-6 text-muted-foreground">
                  Прошедшие
                </h2>
                <div className="flex flex-col gap-0 opacity-80">
                  {past.map((event) => (
                    <EventRow key={event.id} event={event as never} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
