import type { LineString } from "geojson";

/** GeoJSON order: [longitude, latitude] */
export type LngLat = [number, number];

/** Display / Yandex Router waypoints: [latitude, longitude] */
export type LatLng = [number, number];

export function isValidLat(lat: number): boolean {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

export function isValidLng(lng: number): boolean {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

export function latLngToLngLat(lat: number, lng: number): LngLat {
  return [lng, lat];
}

export function lngLatToLatLng([lng, lat]: LngLat): LatLng {
  return [lat, lng];
}

export function yandexPointToLngLat([lat, lng]: LatLng): LngLat {
  return [lng, lat];
}

export function toLineString(coords: LngLat[]): LineString | null {
  if (coords.length < 2) return null;
  return { type: "LineString", coordinates: coords };
}

export function normalizeLineString(
  value: unknown
): LineString | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as { type?: string; coordinates?: unknown };
  if (obj.type !== "LineString" || !Array.isArray(obj.coordinates)) {
    return null;
  }

  const coordinates: LngLat[] = [];
  for (const item of obj.coordinates) {
    if (!Array.isArray(item) || item.length < 2) continue;
    const lng = Number(item[0]);
    const lat = Number(item[1]);
    if (!isValidLat(lat) || !isValidLng(lng)) continue;
    if (lat === 0 && lng === 0) continue;
    coordinates.push([lng, lat]);
  }

  return toLineString(coordinates);
}
