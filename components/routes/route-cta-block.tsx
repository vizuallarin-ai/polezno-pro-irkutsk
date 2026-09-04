import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import type { Route } from "@/lib/data/routes";
import { BOOSTY_URL } from "@/lib/site-links";
import { CTA, routeContactHref, assistWalkHref } from "@/lib/cta-constants";

interface RouteCtaBlockProps {
  route: Route;
  variant?: "index" | "detail" | "how-to" | "sales";
}

export function RouteHowToBlock() {
  const items = [
    {
      title: "Самостоятельно",
      text: "Откройте точки на карте, двигайтесь в своём темпе. Подойдёт, если любите гулять без группы.",
    },
    {
      title: "С Алёной",
      text: "Алёна добавит контекст, истории и маршрутные детали, которые не видны с тротуара.",
    },
    {
      title: "В программе",
      text: "Соберём день под ваши интересы: несколько маршрутов, еда, Байкал — одной связкой.",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="border border-border p-6 bg-card"
        >
          <h3 className="type-h3 text-foreground mb-2">
            {item.title}
          </h3>
          <p className="type-body-sm text-muted-foreground">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

export function RouteSalesBlock({ route }: { route: Route }) {
  const guidedHref = routeContactHref(route.slug, "route-sales");

  if (route.type === "free") {
    return (
      <div className="border border-border bg-card p-8 lg:p-10">
        <p className="type-h3 text-foreground mb-3 max-w-xl">
          Хотите пройти этот маршрут глубже — с историями, деталями и живым
          сопровождением?
        </p>
        <p className="type-body-sm text-muted-foreground mb-6 max-w-lg">
          Бесплатная версия — для ориентира. С Алёной увидите то, что не
          попадает в короткие описания точек.
        </p>
        <Link
          href={guidedHref}
          className="cta-label cta-label-wrap-sm inline-flex h-11 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 type-button hover:bg-foreground/90 transition-colors duration-200"
        >
          {CTA.guided.label}
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-8 lg:p-10">
      <div className="flex items-center gap-2 type-meta text-muted-foreground mb-3">
        <Lock size={12} />
        <span>Платный авторский маршрут</span>
      </div>
      <p className="type-h3 text-foreground mb-3 max-w-xl">
        Полная версия — в закрытых материалах или с Алёной
      </p>
      <p className="type-body-sm text-muted-foreground mb-6 max-w-lg">
        Больше точек, подсказки, аудио и PDF. Или пройдите маршрут с автором —
        без самостоятельного поиска деталей.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={BOOSTY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-label inline-flex h-11 items-center justify-center gap-2 bg-baikal text-white px-6 type-button hover:bg-baikal-light transition-colors duration-200"
        >
          Открыть закрытый маршрут
          <ArrowRight size={14} />
        </a>
        <Link
          href={guidedHref}
          className="cta-label cta-label-wrap-sm inline-flex h-11 items-center justify-center gap-2 border border-border px-6 type-button text-foreground hover:bg-muted transition-colors duration-200"
        >
          {CTA.guided.label}
        </Link>
      </div>
    </div>
  );
}

export function RouteIndexCtaBlock() {
  return (
    <section className="border-t border-border bg-baikal text-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="type-h2 text-white mb-4 max-w-none">
            Нужен маршрут под ваш день?
          </h2>
          <p className="type-body text-white/80 mb-8">
            Соберём программу: город, еда, Байкал — без шаблонных экскурсий.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={assistWalkHref("route-index-cta")}
              className="cta-label cta-label-wrap-sm inline-flex h-11 items-center justify-center gap-2 bg-white text-baikal px-6 type-button hover:bg-white/90 transition-colors duration-200"
            >
              {CTA.assist.label}
              <ArrowRight size={14} />
            </Link>
            <Link
              href={CTA.discovery.href}
              className="cta-label inline-flex h-11 items-center justify-center gap-2 border border-white/40 px-6 type-button hover:bg-white/10 transition-colors duration-200"
            >
              {CTA.discovery.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RouteCtaBlock({ route, variant = "detail" }: RouteCtaBlockProps) {
  if (variant === "sales") return <RouteSalesBlock route={route} />;
  if (variant === "how-to") return <RouteHowToBlock />;
  if (variant === "index") return <RouteIndexCtaBlock />;
  return <RouteSalesBlock route={route} />;
}
