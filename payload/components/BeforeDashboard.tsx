import type { CSSProperties } from "react";
import { getPayload } from "payload";
import config from "../../payload.config";

type DashboardCounts = {
  routesTotal: number;
  routesPublished: number;
  articlesPublished: number;
  articlesDraft: number;
  eventsPublished: number;
  excursionsPublished: number;
  productsPublished: number;
  leadsNew: number;
  draftsTotal: number;
};

async function fetchCounts(): Promise<DashboardCounts> {
  try {
    const payload = await getPayload({ config });
    const [
      routesTotal,
      routesPublished,
      routesDraft,
      articlesPublished,
      articlesDraft,
      eventsPublished,
      excursionsPublished,
      productsPublished,
      leadsNew,
    ] = await Promise.all([
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
        collection: "articles",
        where: { status: { equals: "published" } },
      }),
      payload.count({
        collection: "articles",
        where: { status: { equals: "draft" } },
      }),
      payload.count({
        collection: "events",
        where: { status: { equals: "published" } },
      }),
      payload.count({
        collection: "excursions",
        where: { status: { equals: "published" } },
      }),
      payload.count({
        collection: "products",
        where: { status: { equals: "published" } },
      }),
      payload.count({
        collection: "leads",
        where: { status: { equals: "new" } },
      }),
    ]);

    return {
      routesTotal: routesTotal.totalDocs,
      routesPublished: routesPublished.totalDocs,
      articlesPublished: articlesPublished.totalDocs,
      articlesDraft: articlesDraft.totalDocs,
      eventsPublished: eventsPublished.totalDocs,
      excursionsPublished: excursionsPublished.totalDocs,
      productsPublished: productsPublished.totalDocs,
      leadsNew: leadsNew.totalDocs,
      draftsTotal:
        routesDraft.totalDocs +
        articlesDraft.totalDocs,
    };
  } catch {
    return {
      routesTotal: 0,
      routesPublished: 0,
      articlesPublished: 0,
      articlesDraft: 0,
      eventsPublished: 0,
      excursionsPublished: 0,
      productsPublished: 0,
      leadsNew: 0,
      draftsTotal: 0,
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
      label: "Маршруты",
      value: counts.routesTotal,
      href: "/admin/collections/routes",
    },
    {
      label: "Статьи",
      value: counts.articlesPublished,
      href: "/admin/collections/articles?where[status][equals]=published",
    },
    {
      label: "События",
      value: counts.eventsPublished,
      href: "/admin/collections/events?where[status][equals]=published",
    },
    {
      label: "Экскурсии",
      value: counts.excursionsPublished,
      href: "/admin/collections/excursions?where[status][equals]=published",
    },
    {
      label: "Товары",
      value: counts.productsPublished,
      href: "/admin/collections/products?where[status][equals]=published",
    },
    {
      label: "Новые заявки",
      value: counts.leadsNew,
      href: "/admin/collections/leads?where[status][equals]=new",
      highlight: counts.leadsNew > 0,
    },
    {
      label: "Черновики",
      value: counts.draftsTotal,
      href: "/admin/collections/articles?where[status][equals]=draft",
    },
  ];

  const quickActions = [
    { label: "+ Маршрут", href: "/admin/collections/routes/create" },
    { label: "+ Статья", href: "/admin/collections/articles/create" },
    { label: "+ Событие", href: "/admin/collections/events/create" },
    { label: "+ Экскурсия", href: "/admin/collections/excursions/create" },
    { label: "+ Товар", href: "/admin/collections/products/create" },
    { label: "Заявки", href: "/admin/collections/leads" },
    { label: "Настройки", href: "/admin/globals/site-settings" },
  ];

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        CMS «Полезно про Иркутск» — фаза 3B
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
        Управляйте маршрутами, контентом и заявками. Опубликованные материалы
        появляются на публичных страницах сайта.
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
    </div>
  );
}
