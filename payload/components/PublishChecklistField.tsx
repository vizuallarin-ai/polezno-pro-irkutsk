"use client";

import { useFormFields } from "@payloadcms/ui";
import {
  evaluateExcursionPublish,
  evaluateRoutePublish,
  type PublishChecklistResult,
} from "@/lib/admin/publish-checklist";

type Kind = "excursion" | "route";

type Props = {
  kind?: Kind;
};

function evaluate(kind: Kind, values: Record<string, unknown>): PublishChecklistResult {
  return kind === "route"
    ? evaluateRoutePublish(values)
    : evaluateExcursionPublish(values);
}

/**
 * Live publish checklist — mirrors ADMIN.B server guards (shared module).
 */
export default function PublishChecklistField(props: Props) {
  const kind: Kind = props.kind === "route" ? "route" : "excursion";

  const values = useFormFields(([fields]) => {
    const pick = (name: string) => fields[name]?.value;
    if (kind === "excursion") {
      return {
        title: pick("title"),
        shortDescription: pick("shortDescription"),
        price: pick("price"),
        priceOnRequest: pick("priceOnRequest"),
        duration: pick("duration"),
        status: pick("status"),
      } as Record<string, unknown>;
    }
    return {
      title: pick("title"),
      description: pick("description"),
      routePoints: pick("routePoints"),
      type: pick("type"),
      price: pick("price"),
      status: pick("status"),
    } as Record<string, unknown>;
  });

  const result = evaluate(kind, values);
  const aimingPublish = values.status === "published";

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "0.85rem 1rem",
        borderRadius: 8,
        border: `1px solid ${
          result.ready
            ? "var(--theme-success-500)"
            : aimingPublish
              ? "var(--theme-error-500)"
              : "var(--theme-elevation-150)"
        }`,
        background: "var(--theme-elevation-50)",
      }}
    >
      <p
        style={{
          margin: "0 0 0.5rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
        }}
      >
        {kind === "excursion"
          ? "Перед публикацией экскурсии"
          : "Перед публикацией маршрута"}
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: "0.875rem",
          lineHeight: 1.45,
        }}
      >
        {result.items.map((item) => (
          <li key={item.id}>
            <span aria-hidden="true">{item.ok ? "✓" : "✕"} </span>
            {item.label}
          </li>
        ))}
      </ul>
      {!result.ready ? (
        <p
          style={{
            margin: "0.6rem 0 0",
            fontSize: "0.75rem",
            opacity: 0.8,
          }}
        >
          Черновик можно сохранить неполным. При статусе «Опубликован» сервер
          проверит те же требования.
        </p>
      ) : (
        <p
          style={{
            margin: "0.6rem 0 0",
            fontSize: "0.75rem",
            opacity: 0.8,
          }}
        >
          Основные поля для публикации заполнены.
        </p>
      )}
    </div>
  );
}
