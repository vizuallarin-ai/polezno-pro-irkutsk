import type { LineString } from "geojson";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin/verify-payload-auth";
import { getPayloadClient } from "@/lib/payload";
import { normalizeLineString } from "@/lib/route-geometry/coordinates";
import { buildPedestrianRouteViaYandex } from "@/lib/route-geometry/providers/yandex-router";
import {
  activateGeometrySource,
  applyApiGeometryToFields,
  applyManualGeometryToFields,
  buildFallbackGeometry,
  getOrderedRoutePoints,
  getPublicRouteGeometry,
  syncRouteGeometryFields,
} from "@/lib/route-geometry/service";
import { RouteGeometryError } from "@/lib/route-geometry/types";
import type { RouteGeometryFields, RoutePointInput } from "@/lib/route-geometry/types";

const actionSchema = z.object({
  action: z.enum([
    "build_pedestrian",
    "save_manual",
    "activate_manual",
    "activate_api",
    "activate_fallback",
    "rebuild_fallback",
  ]),
  geometry: z.unknown().optional(),
  force: z.boolean().optional(),
});

type RouteDocShape = {
  id: string | number;
  slug?: string;
  distance?: number;
  duration?: number;
  routePoints?: RoutePointInput[];
  routeGeometry?: RouteGeometryFields | null;
  geoLine?: LineString;
};

function toRoutePoints(doc: RouteDocShape): RoutePointInput[] {
  return getOrderedRoutePoints(doc.routePoints);
}

async function saveRouteGeometry(
  routeId: string,
  patch: Partial<RouteDocShape>
) {
  const payload = await getPayloadClient();
  const updated = await payload.update({
    collection: "routes",
    id: routeId,
    data: patch,
    depth: 0,
  });

  if (updated.slug) {
    revalidatePath("/map");
    revalidatePath(`/map/${updated.slug}`);
  }

  return updated;
}

function publicPayload(doc: RouteDocShape) {
  const points = toRoutePoints(doc);
  const rg = doc.routeGeometry ?? {};
  const publicGeo = getPublicRouteGeometry({
    routeGeometry: rg,
    routePoints: points,
    legacyGeoLine: normalizeLineString(doc.geoLine),
  });

  return {
    routeGeometry: rg,
    publicGeometry: publicGeo,
    warnings: [],
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ routeId: string }> }
) {
  const auth = await requireAdminUser();
  if (!auth.user) return auth.unauthorizedResponse;

  const { routeId } = await context.params;

  let body: z.infer<typeof actionSchema>;
  try {
    body = actionSchema.parse(await request.json());
  } catch {
    return Response.json(
      { ok: false, error: "Некорректный запрос." },
      { status: 400 }
    );
  }

  const payload = await getPayloadClient();
  let doc: RouteDocShape;
  try {
    doc = (await payload.findByID({
      collection: "routes",
      id: routeId,
      depth: 0,
    })) as RouteDocShape;
  } catch {
    return Response.json(
      { ok: false, error: "Маршрут не найден." },
      { status: 404 }
    );
  }

  const points = toRoutePoints(doc);
  let rg = syncRouteGeometryFields({
    routePoints: points,
    routeGeometry: doc.routeGeometry,
    previousFingerprint: doc.routeGeometry?.pointsFingerprint ?? null,
  });

  try {
    if (body.action === "build_pedestrian") {
      if (
        !body.force &&
        rg.providerRequestHash &&
        rg.apiGeometry &&
        rg.pointsFingerprint
      ) {
        const currentHash = rg.providerRequestHash;
        const rebuilt = await buildPedestrianRouteViaYandex({
          routeId,
          points,
        });
        if (rebuilt.requestHash === currentHash && rg.apiGeometry) {
          return Response.json({
            ok: true,
            message: "Маршрут уже построен для текущих точек.",
            cached: true,
            ...publicPayload({ ...doc, routeGeometry: rg }),
          });
        }
      }

      const result = await buildPedestrianRouteViaYandex({ routeId, points });
      rg = applyApiGeometryToFields(rg, result);
      const publicGeo = getPublicRouteGeometry({
        routeGeometry: rg,
        routePoints: points,
      });

      const saved = await saveRouteGeometry(routeId, {
        routeGeometry: rg,
        geoLine:
          publicGeo.geometry ?? buildFallbackGeometry(points) ?? undefined,
        distance: publicGeo.distanceMeters
          ? Math.round((publicGeo.distanceMeters / 1000) * 10) / 10
          : doc.distance,
        duration: publicGeo.durationMinutesMax ?? doc.duration,
      });

      return Response.json({
        ok: true,
        message: "Маршрут построен через API и сохранён. Проверьте линию и активируйте.",
        cached: false,
        ...publicPayload(saved as RouteDocShape),
      });
    }

    if (body.action === "save_manual") {
      const geometry = normalizeLineString(body.geometry);
      if (!geometry) {
        return Response.json(
          { ok: false, error: "Некорректный GeoJSON LineString." },
          { status: 400 }
        );
      }

      rg = applyManualGeometryToFields(rg, geometry);
      const publicGeo = getPublicRouteGeometry({
        routeGeometry: { ...rg, activeSource: "manual", status: "draft" },
        routePoints: points,
      });

      const saved = await saveRouteGeometry(routeId, {
        routeGeometry: rg,
        geoLine: publicGeo.geometry ?? geometry,
      });

      return Response.json({
        ok: true,
        message: "Ручная линия сохранена.",
        ...publicPayload(saved as RouteDocShape),
      });
    }

    if (body.action === "activate_manual") {
      if (!rg.manualGeometry) {
        return Response.json(
          { ok: false, error: "Сначала сохраните ручную линию." },
          { status: 400 }
        );
      }
      rg = activateGeometrySource(rg, "manual");
    } else if (body.action === "activate_api") {
      if (!rg.apiGeometry) {
        return Response.json(
          { ok: false, error: "Сначала постройте маршрут через API." },
          { status: 400 }
        );
      }
      rg = activateGeometrySource(rg, "yandex_api");
    } else if (body.action === "activate_fallback") {
      rg = activateGeometrySource(rg, "fallback");
    } else if (body.action === "rebuild_fallback") {
      rg = {
        ...rg,
        fallbackGeometry: buildFallbackGeometry(points),
        geometryUpdatedAt: new Date().toISOString(),
      };
    }

    const publicGeo = getPublicRouteGeometry({
      routeGeometry: rg,
      routePoints: points,
    });

    const saved = await saveRouteGeometry(routeId, {
      routeGeometry: rg,
      geoLine:
        publicGeo.geometry ?? buildFallbackGeometry(points) ?? undefined,
      distance: publicGeo.distanceMeters
        ? Math.round((publicGeo.distanceMeters / 1000) * 10) / 10
        : doc.distance,
      duration: publicGeo.durationMinutesMax ?? doc.duration,
    });

    return Response.json({
      ok: true,
      message: "Геометрия маршрута обновлена.",
      ...publicPayload(saved as RouteDocShape),
    });
  } catch (error) {
    if (error instanceof RouteGeometryError) {
      rg = { ...rg, status: "error", lastError: error.message };
      await saveRouteGeometry(routeId, { routeGeometry: rg }).catch(() => undefined);
      return Response.json({ ok: false, error: error.message, code: error.code }, {
        status: 400,
      });
    }

    return Response.json(
      { ok: false, error: "Не удалось обновить геометрию маршрута." },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ routeId: string }> }
) {
  const auth = await requireAdminUser();
  if (!auth.user) return auth.unauthorizedResponse;

  const { routeId } = await context.params;
  const payload = await getPayloadClient();

  try {
    const doc = (await payload.findByID({
      collection: "routes",
      id: routeId,
      depth: 0,
    })) as RouteDocShape;

    const points = toRoutePoints(doc);
    const rg = syncRouteGeometryFields({
      routePoints: points,
      routeGeometry: doc.routeGeometry,
      previousFingerprint: doc.routeGeometry?.pointsFingerprint ?? null,
    });

    return Response.json({
      ...publicPayload({ ...doc, routeGeometry: rg }),
      pointsCount: points.length,
      routerConfigured: Boolean(
        process.env.YANDEX_ROUTER_API_KEY ||
          process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY
      ),
    });
  } catch {
    return Response.json(
      { ok: false, error: "Маршрут не найден." },
      { status: 404 }
    );
  }
}
