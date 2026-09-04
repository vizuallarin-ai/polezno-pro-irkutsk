"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Ошибка
      </p>
      <h1 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
        Что-то пошло не так
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Страница временно недоступна. Обновите её или вернитесь на главную —
        маршруты и контакты на месте.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[44px] items-center justify-center bg-baikal px-5 text-sm text-primary-foreground transition-colors hover:bg-baikal-light"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center border border-border px-5 text-sm text-foreground transition-colors hover:bg-muted"
        >
          На главную
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-[44px] items-center justify-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Написать нам
        </Link>
      </div>
    </div>
  );
}
