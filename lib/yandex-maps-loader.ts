/** Загрузка Яндекс Maps JavaScript API 3.0 (один раз на страницу). */

import type * as Ymaps3 from "@yandex/ymaps3-types";

export type Ymaps3Api = typeof Ymaps3;

export type YandexMapsErrorCode =
  | "missing_key"
  | "script"
  | "ready"
  | "timeout"
  | "browser"
  | "forbidden"
  | "rate_limit"
  | "network";

export class YandexMapsLoadError extends Error {
  constructor(
    message: string,
    readonly code: YandexMapsErrorCode
  ) {
    super(message);
    this.name = "YandexMapsLoadError";
  }
}

let loadPromise: Promise<Ymaps3Api> | null = null;

const REFERER_HELP =
  "В кабинете developer.tech.yandex.ru откройте ключ IrkPortal → Изменить → «Ограничение по HTTP Referer». " +
  "Каждый домен — отдельная строка (формат «irkportal.ru, www.irkportal.ru, localhost» через запятую в одной строке не работает). " +
  "Нужны три строки: irkportal.ru, www.irkportal.ru и localhost — без https:// и без путей. " +
  "Сохраните и подождите до 15 минут.";

export function getYandexMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim() || undefined;
}

function ymapsScriptUrl(apiKey: string): string {
  return `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
}

async function readYandexErrorBody(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message?.trim() ?? "";
  } catch {
    try {
      return (await response.text()).trim().slice(0, 200);
    } catch {
      return "";
    }
  }
}

function forbiddenMessage(status: number, detail: string): string {
  const suffix = detail ? `: «${detail}»` : "";
  const invalidKey = /invalid\s*api\s*key/i.test(detail);

  if (invalidKey) {
    return (
      `Яндекс отклонил ключ (HTTP ${status}${suffix}). ` +
      "Ответ «Invalid api key» часто означает не сам ключ, а неверный Referer: домены через запятую в одной строке не принимаются. " +
      REFERER_HELP
    );
  }

  return `Доступ к Яндекс Картам запрещён (HTTP ${status}${suffix}). ${REFERER_HELP}`;
}

/** Проверяет URL скрипта до вставки <script>, чтобы отличить 403/429 от сетевого сбоя. */
async function probeYandexMapsAccess(apiKey: string): Promise<void> {
  let response: Response;

  try {
    response = await fetch(ymapsScriptUrl(apiKey), {
      method: "GET",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
      cache: "no-store",
    });
  } catch {
    // CORS или сеть — пробуем загрузку через <script>, как раньше.
    return;
  }

  if (response.type === "opaque" || response.status === 0) {
    return;
  }

  if (response.status === 429) {
    throw new YandexMapsLoadError(
      "Превышен лимит запросов к Яндекс Картам. Подождите несколько минут и обновите страницу.",
      "rate_limit"
    );
  }

  if (response.status === 401 || response.status === 403) {
    const detail = await readYandexErrorBody(response);
    throw new YandexMapsLoadError(forbiddenMessage(response.status, detail), "forbidden");
  }

  if (!response.ok) {
    const detail = await readYandexErrorBody(response);
    throw new YandexMapsLoadError(
      `Яндекс Карты вернули ошибку HTTP ${response.status}${detail ? `: «${detail}»` : ""}. Попробуйте обновить страницу.`,
      "script"
    );
  }
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
            `Яндекс Карты не инициализировались за ${timeoutMs / 1000} с. ${REFERER_HELP}`,
            "timeout"
          )
        );
      }
    }, 100);
  });
}

async function injectYandexMapsScript(apiKey: string): Promise<Ymaps3Api> {
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src*="api-maps.yandex.ru/v3"]'
  );
  if (existing) {
    return waitForGlobalYmaps3();
  }

  await probeYandexMapsAccess(apiKey);

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
          `Скрипт Яндекс Карт не загрузился (сеть или блокировка). ${REFERER_HELP}`,
          "script"
        )
      );
    };

    script.onload = () => {
      if (!window.ymaps3) {
        loadPromise = null;
        reject(
          new YandexMapsLoadError(
            `Скрипт загрузился, но API не активирован. ${REFERER_HELP}`,
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
              `Ключ JavaScript API не активирован для этого домена. ${REFERER_HELP}`,
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
