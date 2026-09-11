import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import { redirect } from "next/navigation";
import { OwnerDashboardPanel } from "./OwnerDashboardPanel";
import { fetchOwnerDashboard } from "../dashboard/fetch-owner-dashboard";

/**
 * Owner landing at /admin — replaces default collection-card dashboard.
 */
export default async function OwnerDashboardView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { payload, user, i18n },
    locale,
    permissions,
    visibleEntities,
  } = initPageResult;

  if (!user) {
    redirect("/admin/login");
  }

  let model;
  try {
    model = await fetchOwnerDashboard(payload);
  } catch {
    model = null;
  }

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter className="dashboard">
        {model ? (
          <OwnerDashboardPanel model={model} />
        ) : (
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Главная</h1>
            <p>
              Не удалось загрузить обзор проекта. Откройте разделы слева:
              Заявки, Экскурсии, Маршруты.
            </p>
          </div>
        )}
      </Gutter>
    </DefaultTemplate>
  );
}
