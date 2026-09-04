"use client";

import { LeadForm, type LeadFormProps } from "@/components/forms/lead-form";

type ContactFormProps = Pick<
  LeadFormProps,
  | "consentText"
  | "consentVersion"
  | "privacyPolicyUrl"
  | "sourceSlug"
  | "sourceTitle"
  | "sourceBlock"
  | "defaultRequestType"
  | "defaultMessage"
  | "routeContext"
  | "materialContext"
  | "productContext"
  | "arPostcardContext"
  | "photoContext"
  | "showDate"
  | "showPeopleCount"
  | "showFormat"
  | "submitLabel"
  | "fallbackTelegram"
  | "fallbackMax"
  | "fallbackEmail"
>;

export function ContactForm({
  consentText,
  consentVersion,
  privacyPolicyUrl,
  sourceSlug,
  sourceTitle,
  sourceBlock = "contact-page",
  defaultRequestType = "general_contact",
  defaultMessage,
  routeContext,
  materialContext,
  productContext,
  arPostcardContext,
  photoContext,
  showDate = false,
  showPeopleCount = false,
  showFormat = false,
  submitLabel = "Подобрать мне прогулку",
  fallbackTelegram,
  fallbackMax,
  fallbackEmail,
}: ContactFormProps) {
  return (
    <LeadForm
      id="contact-lead-form"
      variant="contact"
      sourceType="contact"
      sourceSlug={sourceSlug}
      sourceTitle={sourceTitle}
      sourceBlock={sourceBlock}
      defaultRequestType={defaultRequestType}
      defaultMessage={defaultMessage}
      routeContext={routeContext}
      materialContext={materialContext}
      productContext={productContext}
      arPostcardContext={arPostcardContext}
      photoContext={photoContext}
      showDate={showDate}
      showPeopleCount={showPeopleCount}
      showFormat={showFormat}
      submitLabel={submitLabel}
      consentText={consentText}
      consentVersion={consentVersion}
      privacyPolicyUrl={privacyPolicyUrl}
      requireConsent
      fallbackTelegram={fallbackTelegram}
      fallbackMax={fallbackMax}
      fallbackEmail={fallbackEmail}
    />
  );
}
