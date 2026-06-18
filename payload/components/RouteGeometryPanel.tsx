"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LineString } from "geojson";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import {
  formatRouteDistance,
  formatWalkingDuration,
  GEOMETRY_SOURCE_LABELS,
  GEOMETRY_STATUS_LABELS,
} from "@/lib/route-geometry/format";
import { normalizeLineString } from "@/lib/route-geometry/coordinates";
import { RouteGeometryMapEditor } from "./RouteGeometryMapEditor";

type GeometryState = {
  activeSource?: string;
  status?: string;
  distanceMeters?: number;
  durationMinutesMin?: number;
  durationMinutesMax?: number;
  manualGeometry?: LineString | null;
  apiGeometry?: LineString | null;
  fallbackGeometry?: LineString | null;
  lastError?: string | null;
};

type RoutePoint = {
  lat?: number;
  lng?: number;
  title?: string;
  order?: number;
  published?: boolean;
};

type ApiResponse = {
  ok: boolean;
  error?: string;
  message?: string;
  publicGeometry?: {
    source: string;
    status: string;
    distanceMeters: number | null;
    durationMinutesMin: number | null;
    durationMinutesMax: number | null;
    vertexCount: number;
  };
  routeGeometry?: GeometryState;
  pointsCount?: number;
  routerConfigured?: boolean;
  warnings?: string[];
};

export function RouteGeometryPanel() {
  const { id } = useDocumentInfo();
  const routePoints = useFormFields(([fields]) => fields.routePoints?.value) as
    | RoutePoint[]
    | undefined;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ApiResponse | null>(null);
  const [manualDraft, setManualDraft] = useState<LineString | null>(null);
  const [geoJsonText, setGeoJsonText] = useState("");

  const publishedPoints = useMemo(
    () =>
      (routePoints ?? [])
        .filter((p) => p.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => ({
          lat: p.lat ?? 0,
          lng: p.lng ?? 0,
          title: p.title,
          order: p.order,
        })),
    [routePoints]
  );

  const loadState = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/routes/${id}/geometry`, {
        credentials: "include",
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Не удалось загрузить геометрию.");
      }
      setState(data);
      const manual =
        normalizeLineString(data.routeGeometry?.manualGeometry) ??
        normalizeLineString(data.routeGeometry?.apiGeometry) ??
        normalizeLineString(data.routeGeometry?.fallbackGeometry);
      setManualDraft(manual);
      setGeoJsonText(manual ? JSON.stringify(manual, null, 2) : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const callAction = async (
    action: string,
    extra?: Record<string, unknown>
  ) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/routes/${id}/geometry`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Операция не выполнена.");
      }
      setState(data);
      setMessage(data.message ?? "Готово.");
      const manual = normalizeLineString(data.routeGeometry?.manualGeometry);
      if (manual) {
        setManualDraft(manual);
        setGeoJsonText(JSON.stringify(manual, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка операции.");
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <p style={hintStyle}>
        Сохраните маршрут, чтобы настроить линию на карте.
      </p>
    );
  }

  const publicGeo = state?.publicGeometry;
  const rg = state?.routeGeometry;

  return (
    <div style={panelStyle}>
      <h4 style={titleStyle}>Геометрия маршрута</h4>
      <p style={hintStyle}>
        Постройте пешеходную линию через Яндекс, отредактируйте вручную и
        активируйте для публикации. Публичный сайт использует сохранённую линию.
      </p>

      <div style={statsGrid}>
        <Stat label="Источник" value={GEOMETRY_SOURCE_LABELS[publicGeo?.source ?? ""] ?? "—"} />
        <Stat label="Статус" value={GEOMETRY_STATUS_LABELS[publicGeo?.status ?? ""] ?? "—"} />
        <Stat label="Точек маршрута" value={String(state?.pointsCount ?? publishedPoints.length)} />
        <Stat label="Вершин линии" value={String(publicGeo?.vertexCount ?? 0)} />
        <Stat label="Дистанция" value={formatRouteDistance(publicGeo?.distanceMeters)} />
        <Stat
          label="Время"
          value={formatWalkingDuration(
            publicGeo?.durationMinutesMin,
            publicGeo?.durationMinutesMax
          )}
        />
      </div>

      {publishedPoints.length < 2 ? (
        <p style={warnStyle}>Добавьте минимум 2 точки с координатами.</p>
      ) : null}
      {rg?.status === "needs_review" ? (
        <p style={warnStyle}>
          Точки маршрута изменились. Проверьте линию или перестройте её.
        </p>
      ) : null}
      {rg?.lastError ? <p style={errorStyle}>{rg.lastError}</p> : null}
      {error ? <p style={errorStyle}>{error}</p> : null}
      {message ? <p style={okStyle}>{message}</p> : null}

      <div style={actionsRow}>
        <ActionButton
          disabled={loading || publishedPoints.length < 2}
          onClick={() => {
            if (
              !window.confirm(
                "Построить пешеходный маршрут через API Яндекса? Это может расходовать лимит."
              )
            ) {
              return;
            }
            void callAction("build_pedestrian", { force: true });
          }}
        >
          Построить через Яндекс
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => void callAction("activate_api")}
        >
          Использовать API-линию
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => void callAction("activate_manual")}
        >
          Использовать ручную линию
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => void callAction("activate_fallback")}
        >
          Показать fallback
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => void callAction("rebuild_fallback")}
        >
          Пересчитать fallback
        </ActionButton>
      </div>

      {!state?.routerConfigured ? (
        <p style={warnStyle}>
          API-ключ маршрутизации не настроен. Работает ручной редактор и fallback.
        </p>
      ) : null}

      <RouteGeometryMapEditor
        geometry={manualDraft}
        points={publishedPoints}
        onGeometryChange={(geometry) => {
          setManualDraft(geometry);
          if (geometry) setGeoJsonText(JSON.stringify(geometry, null, 2));
        }}
      />

      <label style={labelStyle}>GeoJSON LineString</label>
      <textarea
        value={geoJsonText}
        onChange={(e) => setGeoJsonText(e.target.value)}
        rows={8}
        style={textareaStyle}
        spellCheck={false}
      />

      <div style={actionsRow}>
        <ActionButton
          disabled={loading}
          onClick={() => {
            try {
              const geometry = normalizeLineString(JSON.parse(geoJsonText));
              if (!geometry) {
                setError("Некорректный GeoJSON LineString.");
                return;
              }
              setManualDraft(geometry);
              void callAction("save_manual", { geometry });
            } catch {
              setError("Не удалось разобрать GeoJSON.");
            }
          }}
        >
          Сохранить ручную линию
        </ActionButton>
        <ActionButton
          disabled={loading || !state?.routeGeometry?.apiGeometry}
          onClick={() => {
            const api = normalizeLineString(state?.routeGeometry?.apiGeometry);
            if (!api) return;
            setManualDraft(api);
            setGeoJsonText(JSON.stringify(api, null, 2));
            void callAction("save_manual", { geometry: api });
          }}
        >
          Скопировать API → ручную
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => void loadState()}
        >
          Обновить статус
        </ActionButton>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCard}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={actionBtn}>
      {children}
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  padding: "1rem 0",
  borderTop: "1px solid var(--theme-elevation-150)",
  marginTop: "0.5rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: "0.35rem",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  opacity: 0.8,
  lineHeight: 1.5,
  marginBottom: "0.75rem",
};

const warnStyle: React.CSSProperties = {
  ...hintStyle,
  color: "var(--theme-warning-500)",
};

const errorStyle: React.CSSProperties = {
  ...hintStyle,
  color: "var(--theme-error-500)",
};

const okStyle: React.CSSProperties = {
  ...hintStyle,
  color: "var(--theme-success-500)",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "0.65rem",
  marginBottom: "1rem",
};

const statCard: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "8px",
  padding: "0.65rem 0.75rem",
  background: "var(--theme-elevation-50)",
};

const statValue: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 600,
};

const statLabel: React.CSSProperties = {
  fontSize: "0.75rem",
  opacity: 0.7,
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  margin: "0.75rem 0",
};

const actionBtn: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--theme-elevation-250)",
  background: "var(--theme-elevation-0)",
  cursor: "pointer",
  fontSize: "0.8125rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginBottom: "0.35rem",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--theme-elevation-200)",
  padding: "0.65rem",
  marginBottom: "0.5rem",
};
