import type { Metadata } from "next";
import { BusinessPageContent } from "@/components/business/business-page-content";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";
import { BUSINESS_SEO } from "@/lib/business-constants";
import { getBusinessPageData } from "@/lib/business-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: BUSINESS_SEO.title,
  description: BUSINESS_SEO.description,
  alternates: {
    canonical: BUSINESS_SEO.canonicalPath,
  },
  openGraph: {
    title: BUSINESS_SEO.title,
    description: BUSINESS_SEO.description,
    url: `${getSiteUrl()}${BUSINESS_SEO.canonicalPath}`,
  },
};

interface BusinessPageProps {
  searchParams: Promise<{
    taskType?: string;
    route?: string;
    excursion?: string;
    sourceBlock?: string;
    sourceTitle?: string;
    format?: string;
  }>;
}

function buildInitialMessage(params: {
  route?: string;
  excursion?: string;
  sourceTitle?: string;
  format?: string;
}): string | undefined {
  const parts: string[] = [];
  if (params.sourceTitle) {
    parts.push(`Интересует: ${params.sourceTitle}`);
  } else if (params.excursion) {
    parts.push(`Интересует экскурсия: ${params.excursion}`);
  } else if (params.route) {
    parts.push(`Интересует маршрут: ${params.route}`);
  }
  if (params.format === "corporate") {
    parts.push("Формат: корпоратив / программа");
  }
  return parts.length > 0 ? parts.join(". ") : undefined;
}

export default async function BusinessPage({ searchParams }: BusinessPageProps) {
  const params = await searchParams;
  const { corporateRoutes, businessArticles } = await getBusinessPageData();

  return (
    <>
      <BusinessPageContent
        corporateRoutes={corporateRoutes}
        businessArticles={businessArticles}
        initialTaskType={params.taskType}
        initialRouteSlug={params.route}
        initialExcursionSlug={params.excursion}
        initialSourceBlock={params.sourceBlock || "hero"}
        initialMessage={buildInitialMessage(params)}
      />
      <ContactCtaSection
        variant="business"
        sourceType="business"
        sourceBlock="business-bottom"
        messengersOnly
      />
    </>
  );
}
