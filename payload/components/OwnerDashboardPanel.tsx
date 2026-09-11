import type { CSSProperties } from "react";
import type { OwnerDashboardModel } from "../dashboard/fetch-owner-dashboard";
import { adminEditPath } from "@/lib/admin/admin-routes";

const wrap: CSSProperties = {
  maxWidth: 960,
  marginBottom: "1.5rem",
};

const h1: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  margin: "0 0 0.35rem",
  lineHeight: 1.25,
};

const lead: CSSProperties = {
  margin: "0 0 1.25rem",
  color: "var(--theme-elevation-800)",
  opacity: 0.85,
  lineHeight: 1.45,
  maxWidth: 640,
  fontSize: "0.9375rem",
};

const section: CSSProperties = {
  marginBottom: "1.5rem",
};

const sectionTitle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--theme-elevation-800)",
  opacity: 0.55,
  margin: "0 0 0.65rem",
};

const card: CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
  borderRadius: 8,
  padding: "0.85rem 1rem",
};

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.65rem",
  alignItems: "stretch",
};

const linkReset: CSSProperties = {
  textDecoration: "none",
  color: "inherit",
};

const btn: CSSProperties = {
  ...card,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const primaryBtn: CSSProperties = {
  ...btn,
  background: "var(--theme-success-500)",
  borderColor: "var(--theme-success-500)",
  color: "var(--theme-elevation-0, #fff)",
  fontWeight: 600,
};

function severityBorder(severity: string): string {
  if (severity === "critical") return "var(--theme-error-500)";
  if (severity === "high") return "var(--theme-warning-500, #c47b16)";
  return "var(--theme-elevation-150)";
}

function severityLabel(severity: string): string {
  if (severity === "critical") return "Важно";
  if (severity === "high") return "Внимание";
  if (severity === "medium") return "На заметку";
  return "Инфо";
}

function stateMark(state: string): string {
  if (state === "ok") return "✓";
  if (state === "warn") return "!";
  return "✕";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const COLLECTION_LABEL: Record<string, string> = {
  excursions: "Экскурсия",
  routes: "Маршрут",
  articles: "Статья",
};

type Props = {
  model: OwnerDashboardModel;
};

export function OwnerDashboardPanel({ model }: Props) {
  const {
    attention,
    readiness,
    quickActions,
    leads,
    shelves,
    drafts,
    siteUrl,
    errors,
  } = model;

  const openSite = quickActions.find((a) => a.id === "open-site");

  return (
    <div style={wrap}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.25rem",
        }}
      >
        <div>
          <h1 style={h1}>Главная</h1>
          <p style={lead}>
            Обзор проекта: что требует внимания, готовность к запуску и быстрые
            действия.
          </p>
        </div>
        {openSite ? (
          <a
            href={openSite.href}
            target="_blank"
            rel="noopener noreferrer"
            style={primaryBtn}
          >
            Открыть сайт
          </a>
        ) : null}
      </header>

      {errors.length > 0 ? (
        <div
          role="status"
          style={{
            ...card,
            marginBottom: "1rem",
            borderColor: "var(--theme-warning-500, #c47b16)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            Часть данных не загрузилась. Остальные блоки доступны.
          </p>
          <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
            {errors.map((e) => (
              <li key={e} style={{ fontSize: "0.8125rem", opacity: 0.85 }}>
                {e}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section style={section} aria-labelledby="owner-attention-heading">
        <h2 id="owner-attention-heading" style={sectionTitle}>
          Требует внимания
        </h2>
        {attention.length === 0 ? (
          <div style={card}>
            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
              Срочных задач нет. Можно заняться контентом или проверить заявки.
            </p>
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {attention.map((item) => (
              <li key={item.id}>
                <div
                  style={{
                    ...card,
                    borderLeft: `3px solid ${severityBorder(item.severity)}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem 1rem",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          opacity: 0.65,
                        }}
                      >
                        {severityLabel(item.severity)}
                      </p>
                      <p
                        style={{
                          margin: "0.2rem 0 0",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          margin: "0.25rem 0 0",
                          fontSize: "0.8125rem",
                          opacity: 0.8,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.detail}
                      </p>
                    </div>
                    <a href={item.href} style={{ ...btn, ...linkReset }}>
                      {item.cta}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={section} aria-labelledby="owner-readiness-heading">
        <h2 id="owner-readiness-heading" style={sectionTitle}>
          Готовность к запуску
        </h2>
        <div style={card}>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", opacity: 0.8 }}>
            {readiness.okCount} из {readiness.totalCount} критериев готовы
            {readiness.allCriticalOk
              ? " — минимум для запуска закрыт"
              : " — ещё есть обязательные пробелы"}
          </p>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            {readiness.criteria.map((c) => (
              <li
                key={c.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem 0.75rem",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: "0.9rem",
                }}
              >
                <span>
                  <span aria-hidden="true" style={{ marginRight: "0.4rem" }}>
                    {stateMark(c.state)}
                  </span>
                  <span
                    style={{
                      fontWeight: c.state === "ok" ? 400 : 600,
                    }}
                  >
                    {c.label}
                  </span>
                  <span style={{ opacity: 0.7, marginLeft: "0.35rem" }}>
                    — {c.detail}
                  </span>
                </span>
                {c.state !== "ok" ? (
                  <a href={c.href} style={{ ...linkReset, fontSize: "0.8125rem", fontWeight: 500, textDecoration: "underline" }}>
                    {c.cta}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={section} aria-labelledby="owner-leads-heading">
        <h2 id="owner-leads-heading" style={sectionTitle}>
          Заявки
        </h2>
        <div style={card}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem 1.25rem",
              marginBottom: "0.75rem",
              fontSize: "0.9375rem",
            }}
          >
            <a href={leads.newHref} style={{ ...linkReset, textDecoration: "underline" }}>
              Новых: <strong>{leads.newCount}</strong>
            </a>
            <a
              href={leads.overdueHref}
              style={{
                ...linkReset,
                textDecoration: "underline",
                fontWeight: leads.overdueCount > 0 ? 600 : 400,
              }}
            >
              Просрочено: <strong>{leads.overdueCount}</strong>
            </a>
            <a href={leads.dueTodayHref} style={{ ...linkReset, textDecoration: "underline" }}>
              Сегодня: <strong>{leads.dueTodayCount}</strong>
            </a>
            {leads.unscheduledCount > 0 ? (
              <a
                href={leads.unscheduledHref}
                style={{ ...linkReset, textDecoration: "underline" }}
              >
                Без шага: <strong>{leads.unscheduledCount}</strong>
              </a>
            ) : null}
          </div>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", opacity: 0.75 }}>
            {leads.notify.label}
            {leads.sampleCapped
              ? " · Счётчики по выборке активных заявок (лимит) — при росте объёма уточним запросы."
              : null}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginBottom: leads.recent.length ? "0.75rem" : 0,
            }}
          >
            <a href={leads.allHref} style={{ ...btn, ...linkReset }}>
              Открыть все заявки
            </a>
          </div>
          {leads.recent.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {leads.recent.map((leadItem) => (
                <li
                  key={String(leadItem.id)}
                  style={{
                    padding: "0.4rem 0",
                    borderTop: "1px solid var(--theme-elevation-100)",
                    fontSize: "0.875rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.35rem 0.75rem",
                    justifyContent: "space-between",
                  }}
                >
                  <a
                    href={adminEditPath("leads", leadItem.id)}
                    style={{ ...linkReset, fontWeight: 500, textDecoration: "underline" }}
                  >
                    {leadItem.name}
                  </a>
                  <span style={{ opacity: 0.7 }}>
                    {formatDate(leadItem.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.75 }}>
              Новых заявок пока нет.
            </p>
          )}
        </div>
      </section>

      <section style={section} aria-labelledby="owner-content-heading">
        <h2 id="owner-content-heading" style={sectionTitle}>
          Контент
        </h2>
        <div style={row}>
          {(
            [
              ["Экскурсии", shelves.excursions],
              ["Маршруты", shelves.routes],
              ["Статьи", shelves.articles],
            ] as const
          ).map(([label, shelf]) => (
            <div key={label} style={{ ...card, flex: "1 1 140px", minWidth: 120 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label}</div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginTop: 4 }}>
                опубликовано {shelf.published}
                <br />
                черновиков {shelf.drafts}
              </div>
            </div>
          ))}
          <div style={{ ...card, flex: "1 1 140px", minWidth: 120 }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Отзывы</div>
            <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginTop: 4 }}>
              опубликовано {shelves.reviews.published}
              <br />
              ожидают {shelves.reviews.drafts}
            </div>
          </div>
          <div style={{ ...card, flex: "1 1 140px", minWidth: 120 }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Фото</div>
            <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginTop: 4 }}>
              всего {shelves.photos.total}
              <br />
              готовых {shelves.photos.publishedReady}
            </div>
          </div>
          <div style={{ ...card, flex: "1 1 140px", minWidth: 120 }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Гид</div>
            <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginTop: 4 }}>
              {shelves.guides.hasPlaceholder
                ? "профиль не готов"
                : shelves.guides.publicReady > 0
                  ? "профиль готов"
                  : "нет профиля"}
            </div>
          </div>
        </div>
      </section>

      {drafts.length > 0 ? (
        <section style={section} aria-labelledby="owner-drafts-heading">
          <h2 id="owner-drafts-heading" style={sectionTitle}>
            Черновики
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, ...card }}>
            {drafts.map((d) => (
              <li
                key={`${d.collection}-${d.id}`}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem 0.75rem",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "0.45rem 0",
                  borderBottom: "1px solid var(--theme-elevation-100)",
                  fontSize: "0.875rem",
                }}
              >
                <span>
                  <span style={{ opacity: 0.65 }}>
                    {COLLECTION_LABEL[d.collection] ?? d.collection}
                  </span>
                  {" · "}
                  <strong>{d.title}</strong>
                  {d.updatedAt ? (
                    <span style={{ opacity: 0.65 }}>
                      {" "}
                      · {formatDate(d.updatedAt)}
                    </span>
                  ) : null}
                </span>
                <a
                  href={adminEditPath(d.collection, d.id)}
                  style={{ ...linkReset, textDecoration: "underline", fontWeight: 500 }}
                >
                  Продолжить
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section style={section} aria-labelledby="owner-actions-heading">
        <h2 id="owner-actions-heading" style={sectionTitle}>
          Быстрые действия
        </h2>
        <div style={row}>
          {quickActions
            .filter((a) => a.id !== "open-site")
            .map((action) => (
              <a
                key={action.id}
                href={action.href}
                style={{ ...btn, ...linkReset }}
                {...(action.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {action.label}
              </a>
            ))}
        </div>
        <p
          style={{
            margin: "0.75rem 0 0",
            fontSize: "0.75rem",
            opacity: 0.55,
          }}
        >
          Сайт: {siteUrl}
        </p>
      </section>
    </div>
  );
}
