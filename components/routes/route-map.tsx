"use client";

import { useEffect, useRef, useCallback } from "react";
import type { MapRoute } from "@/types/map";
import type { Route, RoutePoint } from "@/lib/data/routes";
import { routeToMapRoute } from "@/lib/route-adapters";
import { ROUTE_CATEGORY_COLORS } from "@/types/map";
import { cn } from "@/lib/utils";

import {
  IRKUTSK_CENTER,
  IRKUTSK_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
  applyMinimalMapAttribution,
} from "@/lib/map-config";

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

export function RouteMap(props: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layersRef = useRef<Map<string, any>>(new Map());

  const routes: MapRoute[] =
    props.mode === "overview"
      ? props.mapRoutes
      : [routeToMapRoute(props.route)];

  const activeRouteId =
    props.mode === "overview" ? (props.activeRouteId ?? null) : props.route.id;

  const activePointId = props.mode === "detail" ? props.activePointId : null;

  const onRouteSelect =
    props.mode === "overview" ? props.onRouteSelect : undefined;

  const onPointSelect = props.mode === "detail" ? props.onPointSelect : undefined;

  const initMap = useCallback(async () => {
    if (!mapContainer.current || mapRef.current) return;

    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    const map = L.map(mapContainer.current, {
      center: IRKUTSK_CENTER,
      zoom: IRKUTSK_ZOOM,
      zoomControl: false,
    });

    applyMinimalMapAttribution(map);

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    if (props.mode === "overview" && onRouteSelect) {
      map.on("click", () => onRouteSelect(null));
    }

    mapRef.current = { map, L };
  }, [props.mode, onRouteSelect]);

  const drawRoutes = useCallback(async () => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current.clear();

    for (const route of routes) {
      if (!route.geoLine?.coordinates?.length) continue;

      const isActive = route.id === activeRouteId;
      const color = ROUTE_CATEGORY_COLORS[route.category] || "#0B3D5C";
      const isDetail = props.mode === "detail";

      const latlngs = (route.geoLine.coordinates as [number, number][]).map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );

      const bgLine = L.polyline(latlngs, {
        color: "#FAF9F7",
        weight: isActive || isDetail ? 8 : 5,
        opacity: isActive || isDetail ? 0.9 : 0.4,
      }).addTo(map);

      const line = L.polyline(latlngs, {
        color: isActive || isDetail ? color : "#9CA3AF",
        weight: isActive || isDetail ? 4 : 2,
        opacity: isActive || isDetail ? 1 : 0.55,
      }).addTo(map);

      if (props.mode === "overview" && onRouteSelect) {
        line.on("click", (e: Event) => {
          (
            e as MouseEvent & { originalEvent: MouseEvent }
          ).originalEvent?.stopPropagation?.();
          onRouteSelect(route);
        });
        line.on("mouseover", () => {
          (map.getContainer() as HTMLElement).style.cursor = "pointer";
        });
        line.on("mouseout", () => {
          (map.getContainer() as HTMLElement).style.cursor = "";
        });
      }

      layersRef.current.set(`bg-${route.id}`, bgLine);
      layersRef.current.set(`line-${route.id}`, line);

      if (route.places) {
        for (const place of route.places) {
          const isPointActive = activePointId === place.id;
          const pointColor = isPointActive ? color : isActive || isDetail ? color : "#9CA3AF";

          const order =
            props.mode === "detail"
              ? props.route.points.find((p) => p.id === place.id)?.order
              : undefined;

          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:${isPointActive ? 14 : 10}px;height:${isPointActive ? 14 : 10}px;
              border-radius:50%;
              background:${pointColor};
              border:2px solid #FAF9F7;
              box-shadow:0 1px 3px rgba(0,0,0,0.3);
              cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              font-size:9px;font-weight:600;color:#FAF9F7;
              transition:transform 0.15s;
              transform:scale(${isPointActive ? 1.15 : 1});
            ">${order ?? ""}</div>`,
            iconSize: [isPointActive ? 14 : 10, isPointActive ? 14 : 10],
            iconAnchor: [isPointActive ? 7 : 5, isPointActive ? 7 : 5],
          });

          const marker = L.marker(
            [place.coordinates.lat, place.coordinates.lng],
            { icon }
          )
            .addTo(map)
            .bindPopup(
              `<div style="font-family:var(--font-geist-sans,Arial),sans-serif;padding:4px 2px;min-width:160px;">
                <p style="font-size:13px;font-weight:500;color:#1C1C1E;margin:0;">${place.title}</p>
                ${place.description ? `<p style="font-size:11px;color:#6B6B6B;margin:5px 0 0;line-height:1.5;">${place.description}</p>` : ""}
              </div>`,
              { maxWidth: 220, className: "leaflet-popup-minimal" }
            );

          if (props.mode === "detail" && onPointSelect) {
            const fullPoint = props.route.points.find((p) => p.id === place.id);
            marker.on("click", () => {
              if (fullPoint) onPointSelect(fullPoint);
            });
          }

          layersRef.current.set(`marker-${route.id}-${place.id}`, marker);
        }
      }
    }

    if (props.mode === "detail" && routes[0]?.geoLine?.coordinates?.length) {
      const latlngs = (routes[0].geoLine.coordinates as [number, number][]).map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
      map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48] });
    } else if (props.mode === "overview" && activeRouteId) {
      const active = routes.find((r) => r.id === activeRouteId);
      if (active?.geoLine?.coordinates?.length) {
        const latlngs = (active.geoLine.coordinates as [number, number][]).map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );
        map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60] });
      }
    } else if (routes.length > 0) {
      const allCoords: [number, number][] = [];
      for (const r of routes) {
        r.geoLine?.coordinates?.forEach(([lng, lat]) => {
          allCoords.push([lat, lng]);
        });
      }
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });
      }
    }
  }, [
    routes,
    activeRouteId,
    activePointId,
    onRouteSelect,
    onPointSelect,
    props,
  ]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.map.remove();
        mapRef.current = null;
        layersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const timer = setTimeout(drawRoutes, 300);
      return () => clearTimeout(timer);
    }
    drawRoutes();
  }, [drawRoutes]);

  return (
    <div
      ref={mapContainer}
      className={cn("w-full h-full min-h-[280px] leaflet-map", props.className)}
      role="application"
      aria-label={
        props.mode === "detail"
          ? `Карта маршрута ${props.route.title}`
          : "Карта маршрутов по Иркутску"
      }
    />
  );
}
