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
  const useCompact = compact || messengersOnly;
  const showLeadForm = showForm && !messengersOnly;

  return (
    <section
      className={cn(
        "border-t border-border bg-muted/30 py-16 lg:py-20",
        className
      )}
      aria-labelledby={`cta-${resolvedSourceType}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            "grid gap-10 lg:gap-16",
            showLeadForm ? "lg:grid-cols-2 lg:items-start" : "max-w-2xl"
          )}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Связаться
            </p>
            <h2
              id={`cta-${resolvedSourceType}`}
              className="text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-4"
            >
              {resolvedTitle}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
              {resolvedDescription}
            </p>

            {showMessengers && (
              <MessengerLinks
                contact={settings.contact}
                sourceType={resolvedSourceType}
                sourceBlock={sourceBlock}
                layout={useCompact ? "row" : "column"}
              />
            )}

            {variant === "photo" && (
              <Link
                href="/explore/photos/submit"
                className="inline-flex mt-6 text-sm underline underline-offset-4 hover:text-baikal transition-colors"
              >
                {primaryCtaLabel || copy.primaryCtaLabel} →
              </Link>
            )}
          </div>

          {showLeadForm && (
            <div className="border border-border bg-background p-6 lg:p-8">
              <LeadForm
                id={formId}
                variant={useCompact ? "compact" : "full"}
                sourceType={resolvedSourceType}
                sourceSlug={sourceSlug}
                sourceTitle={sourceTitle || routeContext?.title || productContext?.title}
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
                showPeopleCount={variant === "route" || variant === "route_detail"}
                showFormat={variant === "route_detail"}
                submitLabel={primaryCtaLabel || copy.primaryCtaLabel}
                consentText={settings.leadSettings.consentText}
                consentVersion={settings.leadSettings.consentVersion}
                privacyPolicyUrl={settings.leadSettings.privacyPolicyUrl}
                requireConsent
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
