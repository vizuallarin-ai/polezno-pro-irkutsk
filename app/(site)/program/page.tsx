import type { Metadata } from "next";
import { ProgramForm } from "@/components/forms/program-form";

export const metadata: Metadata = {
  title: "Создать программу путешествия — конструктор тура",
  description:
    "Расскажите нам о своих планах — мы подберём оптимальную программу путешествия по Иркутску и Байкалу.",
};

interface ProgramPageProps {
  searchParams: Promise<{ route?: string }>;
}

export default async function ProgramPage({ searchParams }: ProgramPageProps) {
  const { route: routeSlug } = await searchParams;

  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Экскурсии и программы
            </p>
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
              Спланировать
              <br />
              <span className="font-serif italic">визит</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Даты, формат и интересы — ответим в течение суток. Подходит для
              поездки, экскурсии или корпоративной программы.
            </p>

            <div className="flex flex-col gap-4">
              {[
                "Авторские маршруты",
                "Группы и private",
                "Корпоративы и делегации",
                "Сопровождение на месте",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-baikal shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ProgramForm initialRouteSlug={routeSlug} />
          </div>
        </div>
      </div>
    </main>
  );
}
