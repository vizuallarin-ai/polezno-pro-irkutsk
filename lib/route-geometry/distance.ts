import type { LineString } from "geojson";
import type { LngLat } from "./coordinates";

const EARTH_RADIUS_M = 6_371_000;
const WALKING_SPEED_KMH = 4.5;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMeters(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
}

export function calculateGeometryDistanceMeters(
  geometry: LineString | null | undefined
): number {
  if (!geometry?.coordinates?.length || geometry.coordinates.length < 2) {
    return 0;
  }

  let total = 0;
  const coords = geometry.coordinates as LngLat[];
  for (let i = 1; i < coords.length; i += 1) {
    total += haversineMeters(coords[i - 1], coords[i]);
  }
  return Math.round(total);
}

export function estimateWalkingDurationMinutes(distanceMeters: number): {
  min: number;
  max: number;
} {
  if (distanceMeters <= 0) return { min: 0, max: 0 };
  const hours = distanceMeters / 1000 / WALKING_SPEED_KMH;
  const base = Math.round(hours * 60);
  const spread = Math.max(5, Math.round(base * 0.12));
  return {
    min: Math.max(5, base - spread),
    max: base + spread,
  };
}

export function durationFromApiSeconds(seconds: number): {
  min: number;
  max: number;
} {
  const base = Math.round(seconds / 60);
  const spread = Math.max(5, Math.round(base * 0.1));
  return {
    min: Math.max(5, base - spread),
    max: base + spread,
  };
}

export function metersToKilometers(meters: number): number {
  return Math.round((meters / 1000) * 10) / 10;
}
