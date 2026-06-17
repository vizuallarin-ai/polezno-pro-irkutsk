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

const REFERER_HELP =
  "В кабинете Яндекса откройте ключ IrkPortal → Изменить → «Ограничение по HTTP Referer» и укажите: irkportal.ru, www.irkportal.ru, localhost (по одному в строке). Сохраните и подождите 15 минут.";

export function getYandexMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim() || undefined;
}

function ymapsScriptUrl(apiKey: string): string {
  return `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
}

function waitForGlobalYmaps3(timeoutMs = 12_000): Promise<Ymaps3Api> {
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
            `Яндекс Карты не загрузились. ${REFERER_HELP}`,
            "timeout"
          )
        );
      }
    }, 100);
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
    script.id = "yandex-maps-api-v3";
    script.src = ymapsScriptUrl(apiKey);
    script.async = false;
    script.referrerPolicy = "strict-origin-when-cross-origin";

    script.onerror = () => {
      loadPromise = null;
      reject(
        new YandexMapsLoadError(
          `Скрипт Яндекс Карт заблокирован. ${REFERER_HELP}`,
          "script"
        )
      );
    };

    script.onload = () => {
      if (!window.ymaps3) {
        loadPromise = null;
        reject(
          new YandexMapsLoadError(
            `Ключ отклонён Яндексом. ${REFERER_HELP}`,
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
              `Ключ JavaScript API не активирован. ${REFERER_HELP}`,
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
    loadPromise = injectYandexMapsScript(apiKey).catch((err) => {
      loadPromise = null;
      throw err;
    });
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
