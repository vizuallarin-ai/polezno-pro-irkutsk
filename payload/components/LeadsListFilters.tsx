"use client";

import Link from "next/link";

const FILTERS = [
  { label: "Все", href: "/admin/collections/leads" },
  {
    label: "Новые",
    href: "/admin/collections/leads?where[status][equals]=new",
  },
  {
    label: "В работе",
    href: "/admin/collections/leads?where[status][equals]=in_progress",
  },
  {
    label: "Отвечено",
    href: "/admin/collections/leads?where[status][equals]=replied",
  },
  {
    label: "Закрыто",
    href: "/admin/collections/leads?where[status][equals]=closed",
  },
  {
    label: "Спам",
    href: "/admin/collections/leads?where[status][equals]=spam",
  },
  {
    label: "Маршруты",
    href: "/admin/collections/leads?where[or][0][source][equals]=route&where[or][1][requestType][equals]=guided_route&where[or][2][requestType][equals]=route_request",
  },
  {
    label: "B2B",
    href: "/admin/collections/leads?where[or][0][source][equals]=business&where[or][1][requestType][equals]=business_request",
  },
  {
    label: "Сувениры",
    href: "/admin/collections/leads?where[or][0][source][equals]=product_order&where[or][1][source][equals]=product_question&where[or][2][source][equals]=souvenir_general",
  },
  {
    label: "Фото",
    href: "/admin/collections/leads?where[or][0][source][equals]=photos&where[or][1][requestType][equals]=photo_submission_question",
  },
  {
    label: "AR-открытки",
    href: "/admin/collections/leads?where[or][0][source][equals]=ar_postcard_preorder&where[or][1][source][equals]=ar_postcard_question",
  },
  {
    label: "Общие",
    href: "/admin/collections/leads?where[or][0][source][equals]=contacts&where[or][1][source][equals]=direct&where[or][2][requestType][equals]=general_contact",
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
