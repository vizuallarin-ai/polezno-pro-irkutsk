import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Заказ оформлен — спасибо!",
  robots: { index: false },
};

export default function SouvenirsSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-baikal/10 flex items-center justify-center mb-8">
        <Check size={26} className="text-baikal" />
      </div>

      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
        Заказ оформлен
      </p>
      <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
        Спасибо за покупку
      </h1>
      <p className="text-muted-foreground max-w-sm leading-relaxed mb-10">
        Подтверждение придёт на вашу почту. Если это платный маршрут —
        PDF-файл и аудиогид будут в письме.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/souvenirs"
          className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-7 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 group"
        >
          Вернуться в каталог
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/map"
          className="inline-flex h-11 items-center px-7 text-sm border border-border hover:bg-muted transition-colors duration-200"
        >
          Смотреть маршруты
        </Link>
      </div>
    </main>
  );
}
