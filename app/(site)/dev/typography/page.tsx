import type { Metadata } from "next";
import {
  Golos_Text,
  Literata,
  Onest,
  Prata,
  Source_Serif_4,
} from "next/font/google";

export const metadata: Metadata = {
  title: "Typography Lab — UX.D.1",
  robots: { index: false, follow: false },
};

const prata = Prata({
  variable: "--lab-prata",
  subsets: ["cyrillic", "latin"],
  weight: "400",
  display: "swap",
});

const golos = Golos_Text({
  variable: "--lab-golos",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  display: "swap",
});

const literata = Literata({
  variable: "--lab-literata",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const onest = Onest({
  variable: "--lab-onest",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--lab-source-serif",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const fontVars = [
  prata.variable,
  golos.variable,
  literata.variable,
  onest.variable,
  sourceSerif.variable,
].join(" ");

type FontPair = {
  id: string;
  label: string;
  displayVar: string;
  bodyVar: string;
  displayName: string;
  bodyName: string;
};

const PAIRS: FontPair[] = [
  {
    id: "a",
    label: "A — Prata + Golos Text",
    displayVar: "--lab-prata",
    bodyVar: "--lab-golos",
    displayName: "Prata",
    bodyName: "Golos Text",
  },
  {
    id: "b",
    label: "B — Literata + Onest",
    displayVar: "--lab-literata",
    bodyVar: "--lab-onest",
    displayName: "Literata",
    bodyName: "Onest",
  },
  {
    id: "c",
    label: "C — Source Serif 4 + Golos Text",
    displayVar: "--lab-source-serif",
    bodyVar: "--lab-golos",
    displayName: "Source Serif 4",
    bodyName: "Golos Text",
  },
];

const SAMPLES = {
  heroTitle: "Иркутск без штампов",
  heroLead:
    "Маршруты, экскурсии и подборка мест — от Алёны Ямщиковой, которая живёт в этом городе.",
  articleTitle: "Деревянный Иркутск: слои и детали",
  articleBody:
    "Резные наличники, трамваи и дворы-проходняки — то, что редко попадает в открытки. Город читается не по «топ-10», а по маршруту внимания.",
  routeTitle: "Прогулки по теме",
  routeMeta: "Маршрут · 2,5 км · 90 мин",
  quote:
    "Иркутск — это город, который меняет тех, кто в нём остаётся",
} as const;

function PairSample({ pair }: { pair: FontPair }) {
  const displayFamily = `var(${pair.displayVar}), serif`;
  const bodyFamily = `var(${pair.bodyVar}), sans-serif`;

  return (
    <section
      className="border border-border bg-card p-8 lg:p-10"
      aria-labelledby={`pair-${pair.id}-heading`}
    >
      <header className="mb-8 pb-6 border-b border-border">
        <p className="type-eyebrow text-muted-foreground mb-2">{pair.label}</p>
        <h2
          id={`pair-${pair.id}-heading`}
          className="type-page-title text-foreground"
        >
          {pair.displayName} + {pair.bodyName}
        </h2>
        <p className="type-lead text-muted-foreground mt-3 max-w-prose">
          Сравнение кириллических образцов: hero, статья, маршрут, цитата.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="type-eyebrow text-muted-foreground">Hero</p>
          <h3
            className="text-[clamp(2.25rem,3vw+1rem,4rem)] leading-[1.02] tracking-[-0.02em] text-foreground"
            style={{ fontFamily: displayFamily, fontWeight: 400 }}
          >
            {SAMPLES.heroTitle}
          </h3>
          <p
            className="text-[clamp(1.125rem,0.35vw+1rem,1.375rem)] leading-[1.5] text-muted-foreground max-w-md"
            style={{ fontFamily: bodyFamily }}
          >
            {SAMPLES.heroLead}
          </p>
        </div>

        <div className="space-y-3">
          <p className="type-eyebrow text-muted-foreground">Статья</p>
          <h3
            className="text-[clamp(1.5rem,1.2vw+1rem,2.25rem)] leading-[1.15] tracking-[-0.015em] text-foreground"
            style={{ fontFamily: displayFamily, fontWeight: 400 }}
          >
            {SAMPLES.articleTitle}
          </h3>
          <p
            className="text-[1.0625rem] leading-[1.65] text-muted-foreground"
            style={{ fontFamily: bodyFamily }}
          >
            {SAMPLES.articleBody}
          </p>
        </div>

        <div className="space-y-3">
          <p className="type-eyebrow text-muted-foreground">Маршрут</p>
          <h3
            className="text-[clamp(1.75rem,2vw+0.85rem,2.75rem)] leading-[1.15] tracking-[-0.015em] text-foreground"
            style={{ fontFamily: displayFamily, fontWeight: 400 }}
          >
            {SAMPLES.routeTitle}
          </h3>
          <p
            className="text-[0.875rem] leading-[1.65] text-muted-foreground uppercase tracking-[0.04em]"
            style={{ fontFamily: bodyFamily }}
          >
            {SAMPLES.routeMeta}
          </p>
        </div>

        <div className="space-y-3">
          <p className="type-eyebrow text-muted-foreground">Цитата</p>
          <blockquote className="border-l-2 border-baikal pl-5">
            <p
              className="text-[clamp(1.25rem,0.8vw+1rem,1.625rem)] italic leading-[1.5] text-foreground"
              style={{ fontFamily: displayFamily }}
            >
              {SAMPLES.quote}
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export default function TypographyLabPage() {
  return (
    <main className={`pt-24 ${fontVars}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <header className="mb-12 max-w-2xl">
          <p className="type-eyebrow text-muted-foreground mb-4">UX.D.1 Lab</p>
          <h1 className="type-page-title text-foreground mb-4">
            Типографика: сравнение пар
          </h1>
          <p className="type-lead text-muted-foreground">
            Внутренняя страница для сравнения шрифтовых пар на кириллице.
            Production: пара C (Source Serif 4 + Golos Text).
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {PAIRS.map((pair) => (
            <PairSample key={pair.id} pair={pair} />
          ))}
        </div>
      </div>
    </main>
  );
}
