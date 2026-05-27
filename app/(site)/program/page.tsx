import type { Metadata } from "next";
import { ProgramForm } from "@/components/forms/program-form";

export const metadata: Metadata = {
  title: "Создать программу путешествия — конструктор тура",
  description:
    "Расскажите нам о своих планах — мы подберём оптимальную программу путешествия по Иркутску и Байкалу.",
};

export default function ProgramPage() {
  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Организация туров
            </p>
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
              Создать
              <br />
              <span className="font-serif italic">программу</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Расскажите нам о своих планах — даты, интересы, бюджет. Мы
              разработаем индивидуальную программу и свяжемся с вами в течение
              24 часов.
            </p>

            <div className="flex flex-col gap-4">
              {[
                "Индивидуальный подход",
                "Авторские маршруты",
                "Поддержка 24/7",
                "Гарантия качества",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-baikal shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ProgramForm />
          </div>
        </div>
      </div>
    </main>
  );
}
