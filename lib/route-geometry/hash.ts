import type { RoutePointInput } from "./types";
import { latLngToLngLat } from "./coordinates";

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

export function computePointsFingerprint(points: RoutePointInput[]): string {
  const normalized = points
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => ({
      lat: Number(p.lat.toFixed(6)),
      lng: Number(p.lng.toFixed(6)),
      order: p.order ?? 0,
    }));

  return stableStringify(normalized);
}

export function computeProviderRequestHash(input: {
  routeId: string;
  points: RoutePointInput[];
  mode: "walking";
  provider: string;
}): string {
  const coords = input.points
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => latLngToLngLat(p.lat, p.lng));

  return stableStringify({
    routeId: input.routeId,
    mode: input.mode,
    provider: input.provider,
    coordinates: coords,
  });
}
