import type { CSSProperties } from "react";
import { getPayload } from "payload";
import config from "../../payload.config";

type Counts = {
  routes: number;
  articles: number;
  events: number;
  products: number;
  newLeads: number;
};

async function fetchCounts(): Promise<Counts> {
  try {
    const payload = await getPayload({ config });
    const [routes, articles, events, products, leads] = await Promise.all([
      payload.count({ collection: "routes" }),
      payload.count({ collection: "articles" }),
      payload.count({ collection: "events" }),
      payload.count({ collection: "products" }),
      payload.count({
        collection: "leads",
        where: { status: { equals: "new" } },
      }),
    ]);
    return {
      routes: routes.totalDocs,
      articles: articles.totalDocs,
      events: events.totalDocs,
      products: products.totalDocs,
      newLeads: leads.totalDocs,
    };
  } catch {
    return { routes: 0, articles: 0, events: 0, products: 0, newLeads: 0 };
  }
}

const statStyle: CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "8px",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
  minWidth: "120px",
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

export default async function BeforeDashboard() {
  const counts = await fetchCounts();

  const stats = [
    { label: "Маршруты", value: counts.routes, href: "/admin/collections/routes" },
    { label: "Статьи", value: counts.articles, href: "/admin/collections/articles" },
    { label: "События", value: counts.events, href: "/admin/collections/events" },
    { label: "Товары", value: counts.products, href: "/admin/collections/products" },
    {
      label: "Новые заявки",
      value: counts.newLeads,
      href: "/admin/collections/leads",
      highlight: counts.newLeads > 0,
    },
  ];

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Добро пожаловать в CMS «Полезно про Иркутск»
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
        Управляйте маршрутами, статьями, событиями, товарами и заявками. Опубликованный
        контент автоматически появляется на сайте.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
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
    </div>
  );
}
