"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LineString } from "geojson";
import { loadYandexMaps } from "@/lib/yandex-maps-loader";
import { IRKUTSK_CENTER_LNG_LAT, IRKUTSK_ZOOM } from "@/lib/map-config";
import { normalizeLineString } from "@/lib/route-geometry/coordinates";

type RoutePoint = { lat: number; lng: number; title?: string; order?: number };

type YMapInstance = {
  addChild: (child: unknown) => void;
  removeChild: (child: unknown) => void;
  setLocation: (location: {
    center?: [number, number];
    zoom?: number;
    bounds?: [[number, number], [number, number]];
  }) => void;
  destroy?: () => void;
};

type Props = {
  geometry: LineString | null;
  points: RoutePoint[];
  onGeometryChange: (geometry: LineString | null) => void;
};

export function RouteGeometryMapEditor({
  geometry,
  points,
  onGeometryChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const layersRef = useRef<unknown[]>([]);
  const geometryRef = useRef<LineString | null>(geometry);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);

  const clearLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const child of layersRef.current) {
      try {
        map.removeChild(child);
      } catch {
        /* noop */
      }
      (child as { destroy?: () => void }).destroy?.();
    }
    layersRef.current = [];
  }, []);

  const redraw = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    const ymaps3 = await loadYandexMaps();
    const { YMapFeature, YMapMarker, YMapListener } = ymaps3;
    clearLayers();

    const current = geometryRef.current;
    const coords = (current?.coordinates ?? []) as [number, number][];

    if (coords.length >= 2) {
      const line = new YMapFeature({
        id: "manual-line",
        geometry: { type: "LineString", coordinates: coords },
        style: { stroke: [{ color: "#0B3D5C", width: 4 }] },
      });
      const bg = new YMapFeature({
        id: "manual-line-bg",
        geometry: { type: "LineString", coordinates: coords },
        style: { stroke: [{ color: "#FAF9F7", width: 7 }] },
      });
      map.addChild(bg);
      map.addChild(line);
      layersRef.current.push(bg, line);

      coords.forEach((coord, index) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width:12px;height:12px;border-radius:50%;
          background:${selectedIndex === index ? "#C47A2E" : "#0B3D5C"};
          border:2px solid #FAF9F7;cursor:grab;
          box-shadow:0 1px 3px rgba(0,0,0,.25);
        `;
        el.title = `Вершина ${index + 1}`;

        let dragging = false;
        el.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          dragging = true;
          setSelectedIndex(index);
        });
        window.addEventListener("mouseup", () => {
          dragging = false;
        });
        el.addEventListener("mousemove", (e) => {
          if (!dragging) return;
          e.preventDefault();
        });

        const marker = new YMapMarker(
          {
            coordinates: coord,
            draggable: true,
            onDragMove: (coordsLngLat) => {
              const next = [...coords];
              next[index] = [coordsLngLat[0], coordsLngLat[1]];
              const nextGeometry = normalizeLineString({
                type: "LineString",
                coordinates: next,
              });
              geometryRef.current = nextGeometry;
              onGeometryChange(nextGeometry);
            },
            onFastClick: () => setSelectedIndex(index),
          },
          el
        );
        map.addChild(marker);
        layersRef.current.push(marker);
      });
    }

    for (const point of points) {
      const el = document.createElement("div");
      el.style.cssText = `
        width:10px;height:10px;border-radius:50%;
        background:#C47A2E;border:2px solid #FAF9F7;
      `;
      el.title = point.title ?? "Точка маршрута";
      const marker = new YMapMarker(
        { coordinates: [point.lng, point.lat] },
        el
      );
      map.addChild(marker);
      layersRef.current.push(marker);
    }

    const listener = new YMapListener({
      layer: "any",
      onClick: (_object, event) => {
        if (!event.coordinates) return;
        const clickCoord: [number, number] = [
          event.coordinates[0],
          event.coordinates[1],
        ];
        const nextCoords = [...coords, clickCoord];
        const nextGeometry = normalizeLineString({
          type: "LineString",
          coordinates: nextCoords,
        });
        geometryRef.current = nextGeometry;
        onGeometryChange(nextGeometry);
      },
    });
    map.addChild(listener);
    layersRef.current.push(listener);
  }, [clearLayers, onGeometryChange, points, selectedIndex]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || mapRef.current) return;
      try {
        const ymaps3 = await loadYandexMaps();
        if (cancelled || !containerRef.current) return;
        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;
        const map = new YMap(
          containerRef.current,
          {
            location: { center: IRKUTSK_CENTER_LNG_LAT, zoom: IRKUTSK_ZOOM },
          },
          [
            new YMapDefaultSchemeLayer({ theme: "light" }),
            new YMapDefaultFeaturesLayer({}),
          ]
        ) as unknown as YMapInstance;
        mapRef.current = map;
        setMapError(null);
        await redraw();
      } catch (error) {
        setMapError(
          error instanceof Error ? error.message : "Карта недоступна в админке."
        );
      }
    }

    init();
    return () => {
      cancelled = true;
      clearLayers();
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, [clearLayers, redraw]);

  useEffect(() => {
    redraw();
  }, [geometry, redraw]);

  const handleRemoveVertex = () => {
    if (selectedIndex === null || !geometry?.coordinates) return;
    const next = geometry.coordinates.filter((_, i) => i !== selectedIndex) as [
      number,
      number,
    ][];
    const nextGeometry = normalizeLineString({
      type: "LineString",
      coordinates: next,
    });
    geometryRef.current = nextGeometry;
    onGeometryChange(nextGeometry);
    setSelectedIndex(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={handleRemoveVertex}
          disabled={selectedIndex === null}
          style={buttonStyle}
        >
          Удалить выбранную вершину
        </button>
        <button
          type="button"
          onClick={() => {
            geometryRef.current = null;
            onGeometryChange(null);
            setSelectedIndex(null);
          }}
          style={buttonStyle}
        >
          Очистить линию
        </button>
      </div>
      <p style={hintStyle}>
        Клик по карте добавляет вершину. Перетаскивайте вершины линии. Оранжевые
        точки — остановки маршрута.
      </p>
      {mapError ? (
        <p style={{ color: "var(--theme-error-500)", fontSize: "0.875rem" }}>
          {mapError}
        </p>
      ) : (
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "360px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid var(--theme-elevation-150)",
          }}
        />
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--theme-elevation-250)",
  background: "var(--theme-elevation-0)",
  cursor: "pointer",
  fontSize: "0.8125rem",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  opacity: 0.75,
  marginBottom: "0.75rem",
  lineHeight: 1.45,
};
