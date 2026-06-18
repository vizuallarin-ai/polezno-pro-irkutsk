"use client";

import Link from "next/link";

const FILTERS = [
  { label: "Все", href: "/admin/collections/leads" },
  {
    label: "B2B",
    href: "/admin/collections/leads?where[source][equals]=business",
  },
  {
    label: "Новые",
    href: "/admin/collections/leads?where[status][equals]=new",
  },
  {
    label: "B2B новые",
    href: "/admin/collections/leads?where[and][0][source][equals]=business&where[and][1][status][equals]=new",
  },
] as const;

export default function LeadsListFilters() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "16px",
        padding: "12px 16px",
        background: "var(--theme-elevation-50)",
        borderRadius: "4px",
        border: "1px solid var(--theme-elevation-150)",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--theme-elevation-500)", marginRight: "4px" }}>
        Быстрый фильтр:
      </span>
      {FILTERS.map((filter) => (
        <Link
          key={filter.label}
          href={filter.href}
          style={{
            fontSize: "13px",
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid var(--theme-elevation-200)",
            background: "var(--theme-elevation-0)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}
