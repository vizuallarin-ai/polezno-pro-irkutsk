import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PhotoSubmitForm } from "@/components/photos/photo-submit-form";

export const metadata: Metadata = {
  title: "Предложить фото — Фото Иркутска",
  description:
    "Отправьте своё фото Иркутска в архив Иркпортала. Публикация только после модерации.",
  robots: { index: false, follow: true },
};

export default function PhotoSubmitPage() {
  return (
    <div className="pt-24 lg:pt-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
        <Link
          href="/explore/photos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft size={14} />
          Фото Иркутска
        </Link>
        <h1 className="text-3xl font-medium mb-3">Предложить фото</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Фотоархив собирает визуальную память города. Заполните форму — после
          проверки администратор может опубликовать снимок с указанием
          авторства.
        </p>
        <PhotoSubmitForm />
      </div>
    </div>
  );
}
