"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { MapRoute } from "@/types/map";
import type { Route, RoutePoint } from "@/lib/data/routes";
import { routeToMapRoute } from "@/lib/route-adapters";
import { ROUTE_CATEGORY_COLORS } from "@/types/map";
import { cn } from "@/lib/utils";
import {
  IRKUTSK_CENTER_LNG_LAT,
  IRKUTSK_ZOOM,
  boundsFromLngLatCoords,
} from "@/lib/map-config";
import { getYandexMapsApiKey, loadYandexMaps } from "@/lib/yandex-maps-loader";

interface RoutesOverviewMapProps {
  mode: "overview";
  mapRoutes: MapRoute[];
  activeRouteId?: string | null;
  onRouteSelect?: (route: MapRoute | null) => void;
  className?: string;
}

interface RouteDetailMapProps {
  mode: "detail";
  route: Route;
  activePointId?: string | null;
  onPointSelect?: (point: RoutePoint | null) => void;
  className?: string;
}

export type RouteMapProps = RoutesOverviewMapProps | RouteDetailMapProps;

type YMapInstance = {
  addChild: (child: unknown) => void;
  removeChild: (child: unknown) => void;
  setLocation: (location: {
    center?: [number, number];
    zoom?: number;
    bounds?: [[number, number], [number, number]];
    duration?: number;
  }) => void;
  destroy?: () => void;
};

export function RouteMap(props: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const layersRef = useRef<unknown[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mode = props.mode;
  const className = props.className;
  const mapRoutes = mode === "overview" ? props.mapRoutes : undefined;
  const detailRoute = mode === "detail" ? props.route : undefined;
  const activeRouteId =
    mode === "overview" ? (props.activeRouteId ?? null) : detailRoute?.id ?? null;
  const activePointId = mode === "detail" ? (props.activePointId ?? null) : null;
  const onRouteSelect = mode === "overview" ? props.onRouteSelect : undefined;
  const onPointSelect = mode === "detail" ? props.onPointSelect : undefined;

  const routes: MapRoute[] =
    mode === "overview"
      ? (mapRoutes ?? [])
      : detailRoute
        ? [routeToMapRoute(detailRoute)]
        : [];

  const clearLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const child of layersRef.current) {
      try {
        map.removeChild(child);
      } catch {
        /* already removed */
      }
      (child as { destroy?: () => void }).destroy?.();
    }
    layersRef.current = [];
  }, []);

  const drawRoutes = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    try {
      const ymaps3 = await loadYandexMaps();
      const { YMapFeature, YMapMarker, YMapListener } = ymaps3;

      clearLayers();

      if (mode === "overview" && onRouteSelect) {
        const listener = new YMapListener({
          layer: "any",
          onClick: () => onRouteSelect(null),
        });
        map.addChild(listener);
        layersRef.current.push(listener);
      }

      for (const route of routes) {
        if (!route.geoLine?.coordinates?.length) continue;

        const isActive = route.id === activeRouteId;
        const color = ROUTE_CATEGORY_COLORS[route.category] || "#0B3D5C";
        const isDetail = mode === "detail";
        const coordinates = route.geoLine.coordinates as [number, number][];
        const highlighted = isActive || isDetail;

        const routeClick =
          mode === "overview" && onRouteSelect
            ? {
                onFastClick: () => onRouteSelect(route),
              }
            : {};

        const bgLine = new YMapFeature({
          id: `bg-${route.id}`,
          geometry: { type: "LineString", coordinates },
          style: {
            stroke: [
              {
                color: "#FAF9F7",
                width: highlighted ? 8 : 5,
              },
            ],
          },
          ...routeClick,
        });

        const line = new YMapFeature({
          id: `line-${route.id}`,
          geometry: { type: "LineString", coordinates },
          style: {
            stroke: [
              {
                color: highlighted ? color : "#9CA3AF",
                width: highlighted ? 4 : 2,
              },
            ],
          },
          ...routeClick,
        });

        map.addChild(bgLine);
        map.addChild(line);
        layersRef.current.push(bgLine, line);

        if (route.places) {
          for (const place of route.places) {
            const isPointActive = activePointId === place.id;
            const pointColor = isPointActive
              ? color
              : highlighted
                ? color
                : "#9CA3AF";

            const order =
              mode === "detail" && detailRoute
                ? detailRoute.points.find((p) => p.id === place.id)?.order
                : undefined;

            const size = isPointActive ? 14 : 10;
            const el = document.createElement("div");
            el.title = place.title;
            el.style.cssText = `
              width:${size}px;height:${size}px;border-radius:50%;
              background:${pointColor};border:2px solid #FAF9F7;
              box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              font-size:9px;font-weight:600;color:#FAF9F7;
              transform:scale(${isPointActive ? 1.15 : 1});
            `;
            if (order) el.textContent = String(order);

            const marker = new YMapMarker(
              {
                coordinates: [place.coordinates.lng, place.coordinates.lat],
                ...(mode === "detail" && onPointSelect && detailRoute
                  ? {
                      onFastClick: () => {
                        const fullPoint = detailRoute.points.find(
                          (p) => p.id === place.id
                        );
                        if (fullPoint) onPointSelect(fullPoint);
                      },
                    }
                  : {}),
              },
              el
            );

            map.addChild(marker);
            layersRef.current.push(marker);
          }
        }
      }

      const allCoords: [number, number][] = [];
      for (const r of routes) {
        r.geoLine?.coordinates?.forEach((c) => {
          allCoords.push(c as [number, number]);
        });
      }

      if (mode === "detail" && allCoords.length > 0) {
        const bounds = boundsFromLngLatCoords(allCoords);
        if (bounds) map.setLocation({ bounds, duration: 300 });
      } else if (mode === "overview" && activeRouteId) {
        const active = routes.find((r) => r.id === activeRouteId);
        const coords = active?.geoLine?.coordinates as [number, number][] | undefined;
        if (coords?.length) {
          const bounds = boundsFromLngLatCoords(coords);
          if (bounds) map.setLocation({ bounds, duration: 300 });
        }
      } else if (allCoords.length > 0) {
        const bounds = boundsFromLngLatCoords(allCoords);
        if (bounds) map.setLocation({ bounds, duration: 300 });
      }
    } catch {
      setMapError("Ошибка отрисовки маршрутов на карте.");
    }
  }, [
    mode,
    routes,
    activeRouteId,
    activePointId,
    onRouteSelect,
    onPointSelect,
    detailRoute,
    clearLayers,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapContainer.current || mapRef.current) return;

      if (!getYandexMapsApiKey()) {
        setMapError("Карта временно недоступна: не настроен ключ Яндекс Карт.");
        return;
      }

      try {
        const ymaps3 = await loadYandexMaps();
        if (cancelled || !mapContainer.current) return;

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;

        const map = new YMap(
          mapContainer.current,
          {
            location: {
              center: IRKUTSK_CENTER_LNG_LAT,
              zoom: IRKUTSK_ZOOM,
            },
            showScaleInCopyrights: true,
          },
          [
            new YMapDefaultSchemeLayer({ theme: "light" }),
            new YMapDefaultFeaturesLayer({}),
          ]
        ) as unknown as YMapInstance;

        mapRef.current = map;
        setMapError(null);
        setMapReady(true);
      } catch {
        if (!cancelled) {
          setMapError(
            "Не удалось загрузить Яндекс Карты. Попробуйте обновить страницу."
          );
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      clearLayers();
      mapRef.current?.destroy?.();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [clearLayers]);

  useEffect(() => {
    if (!mapReady) return;
    drawRoutes();
  }, [mapReady, drawRoutes]);

  if (mapError) {
    return (
      <div
        className={cn(
          "w-full h-full min-h-[280px] flex items-center justify-center bg-muted px-6 text-center",
          className
        )}
        role="alert"
      >
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {mapError}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className={cn("w-full h-full min-h-[280px] yandex-map", className)}
      role="application"
      aria-label={
        mode === "detail" && detailRoute
          ? `Карта маршрута ${detailRoute.title}`
          : "Карта маршрутов по Иркутску"
      }
    />
  );
}
