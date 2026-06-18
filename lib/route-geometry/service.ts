import type { LineString } from "geojson";
import {
  isValidLat,
  isValidLng,
  latLngToLngLat,
  normalizeLineString,
  toLineString,
} from "./coordinates";
import {
  calculateGeometryDistanceMeters,
  durationFromApiSeconds,
  estimateWalkingDurationMinutes,
  metersToKilometers,
} from "./distance";
import { computePointsFingerprint } from "./hash";
import type {
  GeometrySource,
  GeometryStatus,
  PublicRouteGeometry,
  RouteGeometryFields,
  RoutePointInput,
} from "./types";

export function getOrderedRoutePoints(
  points: RoutePointInput[] | null | undefined
): RoutePointInput[] {
  if (!points?.length) return [];
  return points
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function validateRoutePoints(points: RoutePointInput[]): {
  valid: RoutePointInput[];
  invalidIndexes: number[];
} {
  const ordered = getOrderedRoutePoints(points);
  const invalidIndexes: number[] = [];

  ordered.forEach((p, index) => {
    if (!isValidLat(p.lat) || !isValidLng(p.lng) || (p.lat === 0 && p.lng === 0)) {
      invalidIndexes.push(index);
    }
  });

  return {
    valid: ordered.filter((_, i) => !invalidIndexes.includes(i)),
    invalidIndexes,
  };
}

export function buildFallbackGeometry(
  points: RoutePointInput[]
): LineString | null {
  const ordered = getOrderedRoutePoints(points);
  const coords = ordered
    .filter((p) => isValidLat(p.lat) && isValidLng(p.lng))
    .map((p) => latLngToLngLat(p.lat, p.lng));
  return toLineString(coords);
}

function pickGeometryBySource(
  rg: RouteGeometryFields | null | undefined,
  source: GeometrySource
): LineString | null {
  if (!rg) return null;
  if (source === "manual") return normalizeLineString(rg.manualGeometry);
  if (source === "yandex_api") return normalizeLineString(rg.apiGeometry);
  if (source === "fallback") return normalizeLineString(rg.fallbackGeometry);
  return null;
}

export function getPublicRouteGeometry(input: {
  routeGeometry?: RouteGeometryFields | null;
  routePoints?: RoutePointInput[] | null;
  legacyGeoLine?: LineString | null;
}): PublicRouteGeometry {
  const rg = input.routeGeometry ?? {};
  const points = getOrderedRoutePoints(input.routePoints);
  const fallback =
    normalizeLineString(rg.fallbackGeometry) ?? buildFallbackGeometry(points);
  const showRouteLine = rg.showRouteLine !== false;

  const activeSource = (rg.activeSource ?? "fallback") as GeometrySource;
  const status = (rg.status ?? "active") as GeometryStatus;

  let geometry: LineString | null = null;
  let source: GeometrySource = "none";

  if (showRouteLine) {
    const manual = pickGeometryBySource(rg, "manual");
    const api = pickGeometryBySource(rg, "yandex_api");

    if (activeSource === "manual" && manual) {
      geometry = manual;
      source = "manual";
    } else if (activeSource === "yandex_api" && api) {
      geometry = api;
      source = "yandex_api";
    } else if (activeSource === "fallback" && fallback) {
      geometry = fallback;
      source = "fallback";
    } else if (manual && status === "active") {
      geometry = manual;
      source = "manual";
    } else if (api) {
      geometry = api;
      source = "yandex_api";
    } else if (fallback) {
      geometry = fallback;
      source = "fallback";
    } else {
      geometry = normalizeLineString(input.legacyGeoLine);
      source = geometry ? "fallback" : "none";
    }
  }

  const vertexCount = geometry?.coordinates?.length ?? 0;
  const markersOnly = vertexCount < 2 && points.length > 0;

  const distanceMeters =
    rg.distanceMeters && rg.distanceMeters > 0
      ? rg.distanceMeters
      : geometry
        ? calculateGeometryDistanceMeters(geometry)
        : null;

  return {
    geometry,
    source,
    status,
    distanceMeters,
    durationMinutesMin: rg.durationMinutesMin ?? null,
    durationMinutesMax: rg.durationMinutesMax ?? null,
    showRouteLine,
    lineColor: rg.routeLineColor ?? null,
    vertexCount,
    markersOnly,
  };
}

export function syncRouteGeometryFields(input: {
  routePoints?: RoutePointInput[] | null;
  routeGeometry?: RouteGeometryFields | null;
  previousFingerprint?: string | null;
}): RouteGeometryFields {
  const points = getOrderedRoutePoints(input.routePoints);
  const fingerprint = computePointsFingerprint(points);
  const fallbackGeometry = buildFallbackGeometry(points);
  const rg: RouteGeometryFields = { ...(input.routeGeometry ?? {}) };

  rg.fallbackGeometry = fallbackGeometry;
  rg.pointsFingerprint = fingerprint;

  const pointsChanged =
    Boolean(input.previousFingerprint) &&
    input.previousFingerprint !== fingerprint;

  if (pointsChanged && rg.status === "active") {
    rg.status = "needs_review";
  }

  if (!rg.activeSource) {
    rg.activeSource = fallbackGeometry ? "fallback" : "none";
  }

  if (!rg.status) {
    rg.status = "active";
  }

  if (rg.showRouteLine === undefined || rg.showRouteLine === null) {
    rg.showRouteLine = true;
  }

  const publicGeo = getPublicRouteGeometry({
    routeGeometry: rg,
    routePoints: points,
  });

  if (publicGeo.geometry) {
    const distance =
      publicGeo.distanceMeters ??
      calculateGeometryDistanceMeters(publicGeo.geometry);
    if (!rg.distanceMeters || pointsChanged) {
      rg.distanceMeters = distance;
    }
    if (!rg.durationMinutesMin || !rg.durationMinutesMax || pointsChanged) {
      const duration = estimateWalkingDurationMinutes(distance);
      rg.durationMinutesMin = duration.min;
      rg.durationMinutesMax = duration.max;
    }
  }

  return rg;
}

export function applyApiGeometryToFields(
  rg: RouteGeometryFields,
  result: {
    geometry: LineString;
    distanceMeters: number;
    durationSeconds: number;
    requestHash: string;
    rawResponse: unknown;
  }
): RouteGeometryFields {
  const duration = durationFromApiSeconds(result.durationSeconds);
  return {
    ...rg,
    apiGeometry: result.geometry,
    provider: "yandex",
    providerRequestHash: result.requestHash,
    providerRawResponse: result.rawResponse,
    distanceMeters: result.distanceMeters,
    durationMinutesMin: duration.min,
    durationMinutesMax: duration.max,
    status: "draft",
    geometryUpdatedAt: new Date().toISOString(),
    lastError: null,
  };
}

export function applyManualGeometryToFields(
  rg: RouteGeometryFields,
  geometry: LineString
): RouteGeometryFields {
  const distance = calculateGeometryDistanceMeters(geometry);
  const duration = estimateWalkingDurationMinutes(distance);
  return {
    ...rg,
    manualGeometry: geometry,
    distanceMeters: distance,
    durationMinutesMin: duration.min,
    durationMinutesMax: duration.max,
    geometryUpdatedAt: new Date().toISOString(),
    lastError: null,
  };
}

export function activateGeometrySource(
  rg: RouteGeometryFields,
  source: GeometrySource
): RouteGeometryFields {
  return {
    ...rg,
    activeSource: source,
    status: "active",
    geometryReviewedAt: new Date().toISOString(),
  };
}

export function geometryToLegacyGeoLine(
  publicGeo: PublicRouteGeometry
): LineString | null {
  return publicGeo.geometry;
}

export function publicDistanceKm(publicGeo: PublicRouteGeometry): number {
  if (!publicGeo.distanceMeters) return 0;
  return metersToKilometers(publicGeo.distanceMeters);
}

export function geometryWarnings(input: {
  routePoints?: RoutePointInput[] | null;
  routeGeometry?: RouteGeometryFields | null;
}): string[] {
  const warnings: string[] = [];
  const points = getOrderedRoutePoints(input.routePoints);
  const { invalidIndexes } = validateRoutePoints(points);
  const rg = input.routeGeometry ?? {};

  if (points.length < 2) {
    warnings.push("У маршрута меньше двух точек — линию построить нельзя.");
  }

  if (invalidIndexes.length > 0) {
    warnings.push("У некоторых точек нет корректных координат.");
  }

  if (rg.status === "needs_review") {
    warnings.push(
      "Точки маршрута изменились. Проверьте линию или перестройте её."
    );
  }

  if (!rg.manualGeometry && !rg.apiGeometry && !rg.fallbackGeometry) {
    warnings.push("Линия маршрута ещё не построена.");
  }

  if (rg.apiGeometry && rg.status === "draft") {
    warnings.push("Линия построена через API, но ещё не активирована.");
  }

  return warnings;
}
