import type { LineString } from "geojson";

export type GeometrySource = "manual" | "yandex_api" | "fallback" | "none";

export type GeometryStatus =
  | "draft"
  | "active"
  | "needs_review"
  | "error"
  | "archived";

export type RoutePointInput = {
  lat: number;
  lng: number;
  order?: number;
  title?: string;
  published?: boolean;
};

export type RouteGeometryFields = {
  activeSource?: GeometrySource | null;
  status?: GeometryStatus | null;
  manualGeometry?: LineString | null;
  apiGeometry?: LineString | null;
  fallbackGeometry?: LineString | null;
  showRouteLine?: boolean | null;
  routeLineColor?: string | null;
  distanceMeters?: number | null;
  durationMinutesMin?: number | null;
  durationMinutesMax?: number | null;
  provider?: string | null;
  providerRequestHash?: string | null;
  providerRawResponse?: unknown;
  pointsFingerprint?: string | null;
  geometryUpdatedAt?: string | null;
  geometryReviewedAt?: string | null;
  lastError?: string | null;
};

export type PublicRouteGeometry = {
  geometry: LineString | null;
  source: GeometrySource;
  status: GeometryStatus;
  distanceMeters: number | null;
  durationMinutesMin: number | null;
  durationMinutesMax: number | null;
  showRouteLine: boolean;
  lineColor: string | null;
  vertexCount: number;
  markersOnly: boolean;
};

export type PedestrianRouteResult = {
  geometry: LineString;
  distanceMeters: number;
  durationSeconds: number;
  requestHash: string;
  rawResponse: unknown;
};

export type RouteGeometryErrorCode =
  | "missing_key"
  | "api_unavailable"
  | "rate_limit"
  | "not_found"
  | "insufficient_points"
  | "invalid_coordinates"
  | "provider_error"
  | "save_error"
  | "unauthorized";

export class RouteGeometryError extends Error {
  constructor(
    message: string,
    readonly code: RouteGeometryErrorCode
  ) {
    super(message);
    this.name = "RouteGeometryError";
  }
}
