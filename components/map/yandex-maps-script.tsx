import Script from "next/script";

const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim();

export function YandexMapsScript() {
  if (!apiKey) return null;

  return (
    <Script
      id="yandex-maps-api-v3"
      src={`https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`}
      strategy="beforeInteractive"
    />
  );
}
