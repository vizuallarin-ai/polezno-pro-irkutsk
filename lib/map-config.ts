/** Общие настройки Leaflet-карт (маршруты, /map). */

export const IRKUTSK_CENTER: [number, number] = [52.2978, 104.2964];
export const IRKUTSK_ZOOM = 13;

/** Carto Positron — светлая подложка без API-ключа. */
export const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

/** Короткая подпись вместо длинной строки с leafletjs.com. */
export const MAP_TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

type LeafletMap = {
  attributionControl?: { setPrefix: (prefix: string | false) => void };
};

/** Убирает префикс «Leaflet» со ссылкой на leafletjs.com; тайлы OSM остаются в подписи. */
export function applyMinimalMapAttribution(map: LeafletMap) {
  map.attributionControl?.setPrefix(false);
}
