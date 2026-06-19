"use client";

import { LeadForm } from "@/components/forms/lead-form";

interface ContactFormProps {
  consentText?: string;
  consentVersion?: string;
  privacyPolicyUrl?: string;
}

export function ContactForm({
  consentText,
  consentVersion,
  privacyPolicyUrl,
}: ContactFormProps) {
  return (
    <LeadForm
      id="lead-form"
      variant="full"
      sourceType="contact"
      sourceBlock="contact-page"
      defaultRequestType="general_contact"
      submitLabel="Отправить сообщение"
      consentText={consentText}
      consentVersion={consentVersion}
      privacyPolicyUrl={privacyPolicyUrl}
      requireConsent
    />
  );
}
