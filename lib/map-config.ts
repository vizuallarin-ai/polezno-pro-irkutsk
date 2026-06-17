/** Общие настройки карт маршрутов (Яндекс Maps JS API 3.0). */

/** Центр Иркутска: [долгота, широта] — формат Yandex / GeoJSON. */
export const IRKUTSK_CENTER_LNG_LAT: [number, number] = [104.2964, 52.2978];

/** @deprecated Используйте IRKUTSK_CENTER_LNG_LAT — оставлено для совместимости [lat, lng]. */
export const IRKUTSK_CENTER: [number, number] = [52.2978, 104.2964];

export const IRKUTSK_ZOOM = 13;

export const YANDEX_MAPS_TERMS_URL =
  "https://yandex.ru/legal/maps_api/";

export function boundsFromLngLatCoords(
  coords: [number, number][]
): [[number, number], [number, number]] | null {
  if (coords.length === 0) return null;
  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
