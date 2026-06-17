/** Загрузка Яндекс Maps JavaScript API 3.0 (один раз на страницу). */

import type * as Ymaps3 from "@yandex/ymaps3-types";

export type Ymaps3Api = typeof Ymaps3;

let loadPromise: Promise<Ymaps3Api> | null = null;

export function getYandexMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim() || undefined;
}

export function loadYandexMaps(): Promise<Ymaps3Api> {
  const apiKey = getYandexMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_YANDEX_MAPS_API_KEY is not configured")
    );
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Yandex Maps can only load in the browser"));
  }

  if (window.ymaps3) {
    return window.ymaps3.ready.then(() => window.ymaps3);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.async = true;
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Failed to load Yandex Maps script"));
      };
      script.onload = () => {
        if (!window.ymaps3) {
          loadPromise = null;
          reject(new Error("ymaps3 is undefined after script load"));
          return;
        }
        window.ymaps3.ready
          .then(() => resolve(window.ymaps3))
          .catch((err) => {
            loadPromise = null;
            reject(err);
          });
      };
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
