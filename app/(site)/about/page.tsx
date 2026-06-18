import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "О проекте — манифест «Полезно про Иркутск»",
  description:
    "История и философия проекта «Полезно про Иркутск». Почему мы создаём цифровую культурную платформу про Иркутск и Байкал.",
};

const values = [
  {
    number: "01",
    title: "Глубина вместо поверхности",
    text: "Мы не делаем «топ 10 мест». Мы рассказываем истории, которые меняют восприятие города.",
  },
  {
    number: "02",
    title: "Локальность вместо брендинга",
    text: "Иркутск — это не Байкал и не сувенирные нерпы. Это живой город с культурой, историей и людьми.",
  },
  {
    number: "03",
    title: "Качество вместо количества",
    text: "Меньше маршрутов, но каждый — выверен до последней точки. Меньше событий, но каждое — выбрано с любовью.",
  },
  {
    number: "04",
    title: "Сообщество вместо аудитории",
    text: "Мы строим комьюнити людей, которым важен Иркутск. Туристов, которые станут друзьями города.",
  },
];

async function getSiteSettings() {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    return await payload.findGlobal({ slug: "site-settings" });
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const founderPhoto = settings?.founderPhoto as
    | { url?: string; alt?: string }
    | undefined;

  return (
    <main className="pt-24">
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={founderPhoto?.url || "/images/founder-portrait.svg"}
                  alt={
                    founderPhoto?.alt ||
                    `${settings?.founderName || "Основатель"}, «Полезно про Иркутск»`
                  }
                  fill
                  className="object-cover grayscale"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="mt-6">
                <p className="font-medium">
                  {settings?.founderName
                    ? String(settings.founderName)
                    : "Основатель проекта"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Основатель, «Полезно про Иркутск»
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  Манифест
                </p>
                <h1 className="text-4xl lg:text-5xl font-serif font-light italic leading-[1.2] tracking-tight text-foreground mb-8">
                  «Иркутск — это город, который меняет тех, кто в нём
                  остаётся»
                </h1>

                <div className="flex flex-col gap-6 text-foreground/80 leading-relaxed">
                  <p>
                    Мы начали этот проект, потому что устали видеть, как
                    Иркутск проходят мимо. Туристы приезжают, ставят галочку
                    возле Байкала и уезжают. Но город — это не Байкал. Это
                    деревянные дома с резными наличниками, трамваи,
                    дворы-проходняки, запах смолы и кедра, история декабристов
                    и советских авангардистов.
                  </p>
                  <p>
                    «Полезно про Иркутск» — это попытка показать город таким,
                    каким его знаем мы: живым, слоёным, умным и очень красивым.
                    Не через объективы фотографов из Москвы, а через глаза
                    людей, которые здесь живут и которым здесь важно.
                  </p>
                  <p>
                    Мы верим, что хороший туризм — это не потребление, а
                    встреча. Встреча с местом, с историей, с людьми. Именно
                    такие встречи мы организуем.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-8">Наши ценности</h2>
                <div className="flex flex-col gap-8">
                  {values.map((value) => (
                    <div key={value.number} className="flex gap-6">
                      <span className="text-2xl font-light text-muted-foreground/30 tabular-nums shrink-0 font-serif">
                        {value.number}
                      </span>
                      <div>
                        <p className="font-medium text-foreground mb-2">
                          {value.title}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {value.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div id="guides" className="flex flex-col gap-3">
                <Link
                  href="/about/guides"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group w-fit"
                >
                  <span>Познакомиться с нашими гидами</span>
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/business"
                  className="inline-flex h-12 items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 group"
                >
                  Создать тур с нами
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center px-8 text-sm font-medium border border-border hover:bg-muted transition-colors duration-200"
                >
                  Написать нам
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

