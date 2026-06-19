import type { Metadata } from "next";
import { Suspense } from "react";
import { RoutesPageClient } from "@/components/routes/routes-page-client";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";
import { getExperienceCatalog } from "@/lib/experiences";

export const metadata: Metadata = {
  title: "Маршруты и экскурсии по Иркутску — интерактивная карта",
  description:
    "Готовые маршруты по Иркутску на карте и авторские экскурсии с гидом. Самостоятельные прогулки, форматы с сопровождением и корпоративные программы.",
};

export default async function MapPage() {
  const { experiences, mapRoutes } = await getExperienceCatalog();

  return (
    <>
      <Suspense fallback={null}>
        <RoutesPageClient experiences={experiences} mapRoutes={mapRoutes} />
      </Suspense>
      <ContactCtaSection variant="route" sourceType="routes" sourceBlock="map-index" />
    </>
  );
}
