"use client";

import { useEffect, useRef, useCallback } from "react";
import type { MapRoute } from "@/types/map";
import { ROUTE_CATEGORY_COLORS } from "@/types/map";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface RouteMapProps {
  routes: MapRoute[];
  activeRouteId: string | null;
  onRouteSelect: (route: MapRoute | null) => void;
  className?: string;
}

import {
  IRKUTSK_CENTER,
  IRKUTSK_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
  applyMinimalMapAttribution,
} from "@/lib/map-config";

export function RouteMap({
  routes,
  activeRouteId,
  onRouteSelect,
  className,
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layersRef = useRef<Map<string, any>>(new Map());

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

    map.on("click", () => onRouteSelect(null));

    mapRef.current = { map, L };
  }, [onRouteSelect]);

  const drawRoutes = useCallback(async () => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current.clear();

    for (const route of routes) {
      if (!route.geoLine?.coordinates?.length) continue;

      const isActive = route.id === activeRouteId;
      const color = ROUTE_CATEGORY_COLORS[route.category] || "#0B3D5C";

      // GeoJSON: [lng, lat] → Leaflet: [lat, lng]
      const latlngs = (route.geoLine.coordinates as [number, number][]).map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );

      // Обводка (белая подложка)
      const bgLine = L.polyline(latlngs, {
        color: "#FAF9F7",
        weight: isActive ? 8 : 5,
        opacity: isActive ? 0.9 : 0.4,
      }).addTo(map);

      // Основная линия
      const line = L.polyline(latlngs, {
        color: isActive ? color : "#9CA3AF",
        weight: isActive ? 4 : 2,
        opacity: isActive ? 1 : 0.55,
      }).addTo(map);

      line.on("click", (e: Event) => {
        (e as MouseEvent & { originalEvent: MouseEvent }).originalEvent?.stopPropagation?.();
        onRouteSelect(route);
      });

      line.on("mouseover", () => {
        (map.getContainer() as HTMLElement).style.cursor = "pointer";
      });
      line.on("mouseout", () => {
        (map.getContainer() as HTMLElement).style.cursor = "";
      });

      layersRef.current.set(`bg-${route.id}`, bgLine);
      layersRef.current.set(`line-${route.id}`, line);

      // Маркеры точек интереса
      if (route.places) {
        for (const place of route.places) {
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:10px;height:10px;border-radius:50%;
              background:${isActive ? color : "#9CA3AF"};
              border:2px solid #FAF9F7;
              box-shadow:0 1px 3px rgba(0,0,0,0.3);
              cursor:pointer;
              transition:transform 0.15s;
            "></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });

          const marker = L.marker(
            [place.coordinates.lat, place.coordinates.lng],
            { icon }
          )
            .addTo(map)
            .bindPopup(
              `<div style="font-family:var(--font-geist-sans,Arial),sans-serif;padding:4px 2px;min-width:160px;">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#6B6B6B;margin:0 0 4px;">${place.category}</p>
                <p style="font-size:13px;font-weight:500;color:#1C1C1E;margin:0;">${place.title}</p>
                ${place.description ? `<p style="font-size:11px;color:#6B6B6B;margin:5px 0 0;line-height:1.5;">${place.description}</p>` : ""}
                ${place.isLocalGem ? '<p style="font-size:10px;color:#0B3D5C;margin:4px 0 0;font-weight:500;">Место от локалов</p>' : ""}
              </div>`,
              { maxWidth: 220, className: "leaflet-popup-minimal" }
            );

          layersRef.current.set(`marker-${route.id}-${place.id}`, marker);
        }
      }
    }
  }, [routes, activeRouteId, onRouteSelect]);

  // Инициализация
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

  // Перерисовка при изменении маршрутов / активного
  useEffect(() => {
    if (!mapRef.current) {
      const timer = setTimeout(drawRoutes, 300);
      return () => clearTimeout(timer);
    }
    drawRoutes();
  }, [drawRoutes]);

  // Zoom к активному маршруту
  useEffect(() => {
    if (!mapRef.current || !activeRouteId) return;
    const { map, L } = mapRef.current;
    const route = routes.find((r) => r.id === activeRouteId);
    if (!route?.geoLine?.coordinates?.length) return;

    const latlngs = (route.geoLine.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );
    map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], duration: 0.8 });
  }, [activeRouteId, routes]);

  return (
    <div
      ref={mapContainer}
      className={cn("w-full h-full leaflet-map", className)}
      role="application"
      aria-label="Интерактивная карта маршрутов по Иркутску"
    />
  );
}
