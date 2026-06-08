import type { CSSProperties } from "react";
import { getPayload } from "payload";
import config from "../../payload.config";

type DashboardCounts = {
  routesTotal: number;
  routesPublished: number;
  routesDraft: number;
  leadsNew: number;
  leadsInProgress: number;
};

async function fetchCounts(): Promise<DashboardCounts> {
  try {
    const payload = await getPayload({ config });
    const [routesTotal, routesPublished, routesDraft, leadsNew, leadsInProgress] =
      await Promise.all([
        payload.count({ collection: "routes" }),
        payload.count({
          collection: "routes",
          where: { status: { equals: "published" } },
        }),
        payload.count({
          collection: "routes",
          where: { status: { equals: "draft" } },
        }),
        payload.count({
          collection: "leads",
          where: { status: { equals: "new" } },
        }),
        payload.count({
          collection: "leads",
          where: { status: { equals: "in_progress" } },
        }),
      ]);

    return {
      routesTotal: routesTotal.totalDocs,
      routesPublished: routesPublished.totalDocs,
      routesDraft: routesDraft.totalDocs,
      leadsNew: leadsNew.totalDocs,
      leadsInProgress: leadsInProgress.totalDocs,
    };
  } catch {
    return {
      routesTotal: 0,
      routesPublished: 0,
      routesDraft: 0,
      leadsNew: 0,
      leadsInProgress: 0,
    };
  }
}

const statStyle: CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "8px",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
  minWidth: "120px",
};

const actionStyle: CSSProperties = {
  ...statStyle,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const valueStyle: CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: "0.25rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--theme-elevation-800)",
  opacity: 0.75,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--theme-elevation-800)",
  opacity: 0.55,
  marginBottom: "0.75rem",
};

export default async function BeforeDashboard() {
  const counts = await fetchCounts();

  const stats = [
    {
      label: "Маршрутов всего",
      value: counts.routesTotal,
      href: "/admin/collections/routes",
    },
    {
      label: "Опубликовано",
      value: counts.routesPublished,
      href: "/admin/collections/routes?limit=10&page=1&sort=title&where[status][equals]=published",
    },
    {
      label: "Черновики",
      value: counts.routesDraft,
      href: "/admin/collections/routes?limit=10&page=1&sort=title&where[status][equals]=draft",
    },
    {
      label: "Новые заявки",
      value: counts.leadsNew,
      href: "/admin/collections/leads?limit=10&page=1&sort=-createdAt&where[status][equals]=new",
      highlight: counts.leadsNew > 0,
    },
    {
      label: "Заявки в работе",
      value: counts.leadsInProgress,
      href: "/admin/collections/leads?limit=10&page=1&sort=-createdAt&where[status][equals]=in_progress",
    },
  ];

  const quickActions = [
    {
      label: "+ Новый маршрут",
      href: "/admin/collections/routes/create",
    },
    {
      label: "Все заявки",
      href: "/admin/collections/leads",
    },
    {
      label: "Пользователи CMS",
      href: "/admin/collections/users",
    },
  ];

  const comingSoon = [
    "Статьи",
    "События",
    "Товары",
    "Экскурсии",
    "Места",
    "Гиды",
    "Отзывы",
    "Партнёры",
    "Настройки сайта",
  ];

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        CMS «Полезно про Иркутск» — фаза 3A
      </h2>
      <p
        style={{
          marginBottom: "1.5rem",
          color: "var(--theme-elevation-800)",
          opacity: 0.8,
          maxWidth: "640px",
          lineHeight: 1.5,
        }}
      >
        Управляйте маршрутами и заявками. Опубликованные маршруты появляются на{" "}
        <a href="/map" style={{ color: "inherit" }}>
          /map
        </a>
        ; черновики и скрытые — только здесь.
      </p>

      <p style={sectionTitleStyle}>Сводка</p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.75rem",
        }}
      >
        {stats.map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{
              ...statStyle,
              textDecoration: "none",
              color: "inherit",
              borderColor: item.highlight
                ? "var(--theme-success-500)"
                : "var(--theme-elevation-150)",
            }}
          >
            <div style={valueStyle}>{item.value}</div>
            <div style={labelStyle}>{item.label}</div>
          </a>
        ))}
      </div>

      <p style={sectionTitleStyle}>Быстрые действия</p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.75rem",
        }}
      >
        {quickActions.map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{ ...actionStyle, textDecoration: "none", color: "inherit" }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <p style={sectionTitleStyle}>Позже</p>
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--theme-elevation-800)",
          opacity: 0.7,
          maxWidth: "640px",
          lineHeight: 1.5,
        }}
      >
        {comingSoon.join(" · ")} — будут добавлены в следующих фазах.
      </p>
    </div>
  );
}
