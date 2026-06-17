/** Загрузка Яндекс Maps JavaScript API 3.0 (один раз на страницу). */

import type * as Ymaps3 from "@yandex/ymaps3-types";

export type Ymaps3Api = typeof Ymaps3;

export class YandexMapsLoadError extends Error {
  constructor(
    message: string,
    readonly code: "missing_key" | "script" | "ready" | "timeout" | "browser"
  ) {
    super(message);
    this.name = "YandexMapsLoadError";
  }
}

let loadPromise: Promise<Ymaps3Api> | null = null;

export function getYandexMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim() || undefined;
}

function waitForGlobalYmaps3(timeoutMs = 20_000): Promise<Ymaps3Api> {
  return new Promise((resolve, reject) => {
    if (window.ymaps3) {
      window.ymaps3.ready.then(() => resolve(window.ymaps3)).catch(reject);
      return;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      if (window.ymaps3) {
        window.clearInterval(timer);
        window.ymaps3.ready.then(() => resolve(window.ymaps3)).catch(reject);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        reject(
          new YandexMapsLoadError(
            "Превышено время ожидания загрузки Яндекс Карт.",
            "timeout"
          )
        );
      }
    }, 50);
  });
}

function injectYandexMapsScript(apiKey: string): Promise<Ymaps3Api> {
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src*="api-maps.yandex.ru/v3"]'
  );
  if (existing) {
    return waitForGlobalYmaps3();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "yandex-maps-api-v3-fallback";
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    script.async = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";

    script.onerror = () => {
      loadPromise = null;
      reject(
        new YandexMapsLoadError(
          "Скрипт Яндекс Карт заблокирован. Проверьте ключ и домен irkportal.ru в кабинете разработчика.",
          "script"
        )
      );
    };

    script.onload = () => {
      if (!window.ymaps3) {
        loadPromise = null;
        reject(
          new YandexMapsLoadError(
            "Ключ Яндекс Карт отклонён. В developer.tech.yandex.ru разрешите домены irkportal.ru и www.irkportal.ru для JavaScript API 3.0.",
            "script"
          )
        );
        return;
      }

      window.ymaps3.ready
        .then(() => resolve(window.ymaps3))
        .catch(() => {
          loadPromise = null;
          reject(
            new YandexMapsLoadError(
              "Ключ Яндекс Карт не активирован для JavaScript API. Создайте ключ с типом «JavaScript API и HTTP Геокодер».",
              "ready"
            )
          );
        });
    };

    document.head.appendChild(script);
  });
}

export function loadYandexMaps(): Promise<Ymaps3Api> {
  const apiKey = getYandexMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      new YandexMapsLoadError(
        "NEXT_PUBLIC_YANDEX_MAPS_API_KEY is not configured",
        "missing_key"
      )
    );
  }

  if (typeof window === "undefined") {
    return Promise.reject(
      new YandexMapsLoadError("Yandex Maps can only load in the browser", "browser")
    );
  }

  if (window.ymaps3) {
    return window.ymaps3.ready.then(() => window.ymaps3);
  }

  if (!loadPromise) {
    const hasScript = document.querySelector(
      'script[src*="api-maps.yandex.ru/v3"]'
    );
    loadPromise = (hasScript ? waitForGlobalYmaps3() : injectYandexMapsScript(apiKey)).catch(
      (err) => {
        loadPromise = null;
        throw err;
      }
    );
  }

  return loadPromise;
}

export function yandexMapsErrorMessage(error: unknown): string {
  if (error instanceof YandexMapsLoadError) {
    if (error.code === "missing_key") {
      return "Карта временно недоступна: не настроен ключ Яндекс Карт.";
    }
    return error.message;
  }
  return "Не удалось загрузить Яндекс Карты. Попробуйте обновить страницу.";
}
