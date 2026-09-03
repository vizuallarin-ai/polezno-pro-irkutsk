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
}: ContactFormProps) {
  return (
    <LeadForm
      id="lead-form"
      variant="full"
      sourceType="contact"
      sourceSlug={sourceSlug}
      sourceTitle={sourceTitle}
      sourceBlock={sourceBlock}
      defaultRequestType={defaultRequestType}
      defaultMessage={defaultMessage}
      routeContext={routeContext}
      materialContext={materialContext}
      submitLabel="Отправить сообщение"
      consentText={consentText}
      consentVersion={consentVersion}
      privacyPolicyUrl={privacyPolicyUrl}
      requireConsent
    />
  );
}
