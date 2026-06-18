import type { LineString } from "geojson";
import type { CollectionBeforeChangeHook } from "payload";
import {
  buildFallbackGeometry,
  geometryToLegacyGeoLine,
  getPublicRouteGeometry,
  syncRouteGeometryFields,
} from "@/lib/route-geometry/service";
import { normalizeLineString } from "@/lib/route-geometry/coordinates";
import type { RouteGeometryFields, RoutePointInput } from "@/lib/route-geometry/types";

type RouteChangeData = {
  routePoints?: RoutePointInput[];
  routeGeometry?: RouteGeometryFields | null;
  geoLine?: LineString;
  pointsCount?: number;
  distance?: number;
  duration?: number;
};

export const syncRouteGeometryBeforeChange: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  const typed = data as RouteChangeData;
  const points = typed.routePoints ?? [];
  const published = points.filter((p) => p.published !== false);
  typed.pointsCount = published.length;

  const previousFingerprint =
    (originalDoc as RouteChangeData | undefined)?.routeGeometry
      ?.pointsFingerprint ?? null;

  typed.routeGeometry = syncRouteGeometryFields({
    routePoints: points,
    routeGeometry: typed.routeGeometry ?? (originalDoc as RouteChangeData)?.routeGeometry,
    previousFingerprint,
  });

  const publicGeo = getPublicRouteGeometry({
    routeGeometry: typed.routeGeometry,
    routePoints: points,
    legacyGeoLine:
      normalizeLineString(typed.geoLine) ??
      normalizeLineString((originalDoc as RouteChangeData)?.geoLine),
  });

  typed.geoLine =
    geometryToLegacyGeoLine(publicGeo) ?? buildFallbackGeometry(points) ?? typed.geoLine;

  if (publicGeo.distanceMeters && publicGeo.distanceMeters > 0) {
    typed.distance = Math.round((publicGeo.distanceMeters / 1000) * 10) / 10;
  }

  if (publicGeo.durationMinutesMax && publicGeo.durationMinutesMax > 0) {
    typed.duration = publicGeo.durationMinutesMax;
  }

  const dataWithType = data as RouteChangeData & { type?: string; isPaid?: boolean };
  if (dataWithType.type === "paid") {
    dataWithType.isPaid = true;
  } else if (dataWithType.type === "free") {
    dataWithType.isPaid = false;
  }

  return data;
};
