import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description:
    "Политика обработки персональных данных проекта Иркпортал (irkportal.ru).",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Документ
        </p>
        <h1 className="text-3xl lg:text-4xl font-light tracking-tight mb-8">
          Политика обработки персональных данных
        </h1>

        <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed space-y-6 text-sm">
          <p>
            Настоящая политика описывает, как проект «Иркпортал» (irkportal.ru)
            обрабатывает персональные данные, которые вы добровольно
            предоставляете через формы обратной связи, заявки и другие способы
            связи с сайтом.
          </p>

          <h2 className="text-lg text-foreground font-medium">
            Какие данные мы можем получить
          </h2>
          <p>
            Имя, контакт для связи (телефон, email, мессенджер), текст
            сообщения и технические данные о странице, с которой отправлена
            заявка (URL, источник перехода, UTM-метки).
          </p>

          <h2 className="text-lg text-foreground font-medium">
            Зачем мы их используем
          </h2>
          <p>
            Чтобы ответить на ваш запрос, подготовить маршрут, программу,
            уточнить заказ или обработать предложение для фотоархива. Данные не
            используются для массовых рассылок без отдельного согласия.
          </p>

          <h2 className="text-lg text-foreground font-medium">
            Хранение и доступ
          </h2>
          <p>
            Заявки сохраняются в защищённой админ-панели сайта. Доступ имеют
            только уполномоченные лица проекта. Мы не передаём данные третьим
            лицам без законных оснований.
          </p>

          <h2 className="text-lg text-foreground font-medium">
            Ваши права
          </h2>
          <p>
            Вы можете запросить уточнение, обновление или удаление своих данных,
            написав на контактный email, указанный на странице{" "}
            <Link href="/contact" className="underline underline-offset-2">
              контактов
            </Link>
            .
          </p>

          <p className="text-xs text-muted-foreground/70 pt-8 border-t border-border">
            Документ носит информационный характер. При необходимости юридически
            выверенной редакции обратитесь к специалисту по персональным данным.
            Актуальная версия согласия в формах: 2026-06.
          </p>
        </div>
      </div>
    </main>
  );
}
