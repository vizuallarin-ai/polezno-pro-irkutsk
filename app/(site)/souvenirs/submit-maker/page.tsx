import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MakerPlacementForm } from "@/components/souvenirs/maker-placement-form";

export const metadata: Metadata = {
  title: "Размещение в каталоге мастеров — Сувениры",
  description:
    "Заявка на размещение мастера или мастерской из Иркутска в каталоге сувениров Иркпортала.",
  robots: { index: false, follow: true },
};

export default function SubmitMakerPage() {
  return (
    <div className="pt-24 lg:pt-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
        <Link
          href="/souvenirs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft size={14} />
          Сувениры
        </Link>
        <h1 className="text-3xl font-medium mb-3">Размещение в каталоге мастеров</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Каталог — для местных мастеров и мастерских с иркутским характером.
          Заполните форму: мы рассмотрим заявку и свяжемся с вами. Публикация —
          только после модерации.
        </p>
        <MakerPlacementForm />
      </div>
    </div>
  );
}
