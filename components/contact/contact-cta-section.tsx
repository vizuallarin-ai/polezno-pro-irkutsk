import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSiteSettings } from "@/lib/site-settings";
import { LeadForm } from "@/components/forms/lead-form";
import { MessengerLinks } from "@/components/contact/messenger-links";
import {
  CTA_VARIANT_COPY,
  type CtaVariant,
  type RequestType,
} from "@/lib/leads-constants";

export interface ContactCtaSectionProps {
  variant?: CtaVariant | "route_detail" | "photo_detail" | "explore" | "maker";
  title?: string;
  description?: string;
  primaryCtaLabel?: string;
  sourceType?: string;
  sourceSlug?: string;
  sourceTitle?: string;
  sourceId?: string;
  sourceBlock?: string;
  compact?: boolean;
  showMessengers?: boolean;
  showForm?: boolean;
  messengersOnly?: boolean;
  defaultRequestType?: RequestType;
  defaultMessage?: string;
  routeContext?: { id?: string; slug?: string; title?: string };
  productContext?: {
    id?: string;
    slug?: string;
    title?: string;
    makerId?: string;
  };
  materialContext?: { id?: string; slug?: string; title?: string };
  photoContext?: { id?: string; title?: string };
  arPostcardContext?: { id?: string; slug?: string; title?: string };
  className?: string;
  formId?: string;
}

export async function ContactCtaSection({
  variant = "default",
  title,
  description,
  primaryCtaLabel,
  sourceType,
  sourceSlug,
  sourceTitle,
  sourceId,
  sourceBlock = "cta_section",
  compact = false,
  showMessengers = true,
  showForm = true,
  messengersOnly = false,
  defaultRequestType,
  defaultMessage,
  routeContext,
  productContext,
  materialContext,
  photoContext,
  arPostcardContext,
  className,
  formId,
}: ContactCtaSectionProps) {
  const settings = await getSiteSettings();
  const copyKey = variant in CTA_VARIANT_COPY ? variant : "default";
  const copy = CTA_VARIANT_COPY[copyKey as keyof typeof CTA_VARIANT_COPY];
  const resolvedTitle = title || copy.title;
  const resolvedDescription = description || copy.description;
  const resolvedRequestType = defaultRequestType || copy.defaultRequestType;
  const resolvedSourceType = sourceType || variant;
  const useCompact = true;
  const showLeadForm = showForm && !messengersOnly;

  return (
    <section
      className={cn(
        "border-t border-border/70 surface-quiet section-pad",
        className
      )}
      aria-labelledby={`cta-${resolvedSourceType}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            "grid gap-12 lg:gap-20",
            showLeadForm ? "lg:grid-cols-2 lg:items-start" : "max-w-2xl"
          )}
        >
          <div>
            <p className="type-caption uppercase tracking-[0.22em] text-muted-foreground mb-5">
              {variant === "business"
                ? "Для бизнеса"
                : variant === "route" || variant === "route_detail"
                  ? "Пройти с Алёной"
                  : "Подобрать мне прогулку"}
            </p>
            <h2
              id={`cta-${resolvedSourceType}`}
              className="type-display-l text-foreground mb-5 max-w-[14ch]"
            >
              {resolvedTitle}
            </h2>
            <p className="type-body text-muted-foreground mb-8 max-w-md text-pretty">
              {resolvedDescription}
            </p>

            {showMessengers && (
              <div className="flex flex-col gap-3">
                <p className="type-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Или напишите напрямую
                </p>
                <MessengerLinks
                  contact={settings.contact}
                  sourceType={resolvedSourceType}
                  sourceBlock={sourceBlock}
                  layout={useCompact ? "row" : "column"}
                />
              </div>
            )}

            {variant === "photo" && (
              <Link
                href="/explore/photos/submit"
                className="inline-flex mt-6 type-body-sm underline underline-offset-4 hover:text-baikal transition-colors min-h-[44px] items-center"
              >
                {primaryCtaLabel || copy.primaryCtaLabel} →
              </Link>
            )}
          </div>

          {showLeadForm && (
            <div className="bg-card/80 p-6 sm:p-8 lg:p-10">
              <LeadForm
                id={formId}
                variant="compact"
                sourceType={resolvedSourceType}
                sourceSlug={sourceSlug}
                sourceTitle={
                  sourceTitle ||
                  routeContext?.title ||
                  productContext?.title ||
                  arPostcardContext?.title
                }
                sourceId={sourceId}
                sourceBlock={sourceBlock}
                defaultRequestType={resolvedRequestType}
                defaultMessage={defaultMessage}
                routeContext={routeContext}
                productContext={productContext}
                materialContext={materialContext}
                photoContext={photoContext}
                arPostcardContext={arPostcardContext}
                showDate={variant === "route" || variant === "route_detail"}
                showPeopleCount={
                  variant === "route" || variant === "route_detail"
                }
                submitLabel={primaryCtaLabel || copy.primaryCtaLabel}
                consentText={settings.leadSettings.consentText}
                consentVersion={settings.leadSettings.consentVersion}
                privacyPolicyUrl={settings.leadSettings.privacyPolicyUrl}
                requireConsent
                fallbackTelegram={settings.contact.telegram}
                fallbackMax={settings.contact.max}
                fallbackEmail={settings.contact.email}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
