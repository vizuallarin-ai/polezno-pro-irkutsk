import type { LineString } from "geojson";
import type { LatLng } from "../coordinates";
import { toLineString, yandexPointToLngLat } from "../coordinates";
import {
  RouteGeometryError,
  type PedestrianRouteResult,
  type RoutePointInput,
} from "../types";
import { computeProviderRequestHash } from "../hash";

const YANDEX_ROUTER_URL = "https://api.routing.yandex.net/v2/route";

type YandexRouterResponse = {
  route?: {
    legs?: Array<{
      status?: string;
      steps?: Array<{
        length?: number;
        duration?: number;
        polyline?: { points?: LatLng[] };
      }>;
    }>;
  };
  errors?: Array<{ message?: string }>;
  message?: string;
};

function getRouterApiKey(): string | undefined {
  return (
    process.env.YANDEX_ROUTER_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim() ||
    undefined
  );
}

function validatePoints(points: RoutePointInput[]): RoutePointInput[] {
  const valid = points
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter(
      (p) =>
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        !(p.lat === 0 && p.lng === 0)
    );

  if (valid.length < 2) {
    throw new RouteGeometryError(
      "Для построения маршрута нужно минимум 2 точки с координатами.",
      "insufficient_points"
    );
  }

  return valid;
}

function buildWaypointsParam(points: RoutePointInput[]): string {
  return points.map((p) => `${p.lat},${p.lng}`).join("|");
}

function extractGeometry(response: YandexRouterResponse): {
  geometry: LineString;
  distanceMeters: number;
  durationSeconds: number;
} {
  const legs = response.route?.legs ?? [];
  const coordinates: Array<[number, number]> = [];
  let distanceMeters = 0;
  let durationSeconds = 0;

  for (const leg of legs) {
    if (leg.status && leg.status !== "OK") {
      throw new RouteGeometryError(
        "Яндекс не смог построить пешеходный маршрут между точками.",
        "provider_error"
      );
    }

    for (const step of leg.steps ?? []) {
      distanceMeters += step.length ?? 0;
      durationSeconds += step.duration ?? 0;
      for (const point of step.polyline?.points ?? []) {
        const lngLat = yandexPointToLngLat(point);
        const prev = coordinates[coordinates.length - 1];
        if (!prev || prev[0] !== lngLat[0] || prev[1] !== lngLat[1]) {
          coordinates.push(lngLat);
        }
      }
    }
  }

  const geometry = toLineString(coordinates);
  if (!geometry) {
    throw new RouteGeometryError(
      "API вернул пустую геометрию маршрута.",
      "provider_error"
    );
  }

  return { geometry, distanceMeters, durationSeconds };
}

export async function buildPedestrianRouteViaYandex(input: {
  routeId: string;
  points: RoutePointInput[];
}): Promise<PedestrianRouteResult> {
  const apiKey = getRouterApiKey();
  if (!apiKey) {
    throw new RouteGeometryError(
      "API-ключ маршрутизации не настроен. Добавьте YANDEX_ROUTER_API_KEY или NEXT_PUBLIC_YANDEX_MAPS_API_KEY.",
      "missing_key"
    );
  }

  const points = validatePoints(input.points);
  const requestHash = computeProviderRequestHash({
    routeId: input.routeId,
    points,
    mode: "walking",
    provider: "yandex",
  });

  const url = new URL(YANDEX_ROUTER_URL);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("waypoints", buildWaypointsParam(points));
  url.searchParams.set("mode", "walking");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new RouteGeometryError(
      "Не удалось связаться с API Яндекса. Попробуйте позже или отредактируйте линию вручную.",
      "api_unavailable"
    );
  }

  if (response.status === 429) {
    throw new RouteGeometryError(
      "Превышен лимит запросов к API Яндекса. Подождите и попробуйте снова.",
      "rate_limit"
    );
  }

  let data: YandexRouterResponse;
  try {
    data = (await response.json()) as YandexRouterResponse;
  } catch {
    throw new RouteGeometryError(
      "Некорректный ответ API Яндекса.",
      "provider_error"
    );
  }

  if (!response.ok) {
    const message =
      data.message ??
      data.errors?.[0]?.message ??
      `HTTP ${response.status}`;
    throw new RouteGeometryError(
      `Не удалось построить маршрут через API: ${message}`,
      "provider_error"
    );
  }

  const { geometry, distanceMeters, durationSeconds } = extractGeometry(data);

  return {
    geometry,
    distanceMeters,
    durationSeconds,
    requestHash,
    rawResponse: data,
  };
}

export function isYandexRouterConfigured(): boolean {
  return Boolean(getRouterApiKey());
}
