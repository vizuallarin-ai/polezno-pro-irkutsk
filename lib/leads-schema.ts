import { z } from "zod";
import { HONEYPOT_FIELD, FORM_STARTED_FIELD } from "@/lib/lead-spam";
import { PREFERRED_CONTACT_OPTIONS } from "@/lib/leads-constants";

const preferredValues = PREFERRED_CONTACT_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const trackingFields = {
  sourceType: z.string().optional(),
  sourceSlug: z.string().optional(),
  sourceTitle: z.string().optional(),
  sourceId: z.string().optional(),
  sourceBlock: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  requestType: z.string().optional(),
  interestType: z.string().optional(),
  routeId: z.string().optional(),
  routeSlug: z.string().optional(),
  routeTitle: z.string().optional(),
  materialId: z.string().optional(),
  materialSlug: z.string().optional(),
  articleSlug: z.string().optional(),
  photoId: z.string().optional(),
  arPostcardId: z.string().optional(),
  arPostcardSlug: z.string().optional(),
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  productTitle: z.string().optional(),
  makerId: z.string().optional(),
  eventSlug: z.string().optional(),
  excursionSlug: z.string().optional(),
  selectedFormat: z.string().optional(),
  consentAccepted: z.boolean().optional(),
  consentText: z.string().optional(),
  consentVersion: z.string().optional(),
  [HONEYPOT_FIELD]: z.string().optional(),
  [FORM_STARTED_FIELD]: z.coerce.number().optional(),
};

const baseLeadFields = {
  name: z.string().min(2, "Введите имя").max(200),
  contact: z.string().min(3, "Укажите контакт для связи").max(200),
  preferredContactMethod: z.enum(preferredValues).optional(),
  message: z.string().max(5000).optional(),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  serviceType: z.string().optional(),
  dates: z.string().optional(),
  groupSize: z.coerce.number().optional(),
  budget: z.string().optional(),
  ...trackingFields,
};

function withContactRefine<T extends z.ZodType>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const record = data as {
      preferredContactMethod?: string;
      contact?: string;
      email?: string;
    };
    const method = record.preferredContactMethod;
    if (method === "email" && record.contact && !record.contact.includes("@")) {
      const email = record.email || record.contact;
      if (!z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: "custom",
          message: "Введите корректный email",
          path: ["contact"],
        });
      }
    }
  });
}

export const compactLeadSchema = withContactRefine(z.object(baseLeadFields));

export const fullLeadSchema = withContactRefine(
  z.object({
    ...baseLeadFields,
    message: z.string().min(10, "Опишите задачу").max(5000),
    consentAccepted: z
      .boolean()
      .refine((v) => v === true, {
        message: "Подтвердите согласие на обработку данных",
      }),
  })
);

export type CompactLeadInput = z.infer<typeof compactLeadSchema>;
export type FullLeadInput = z.infer<typeof fullLeadSchema>;

export function extractUtmFromUrl(url: string): Partial<CompactLeadInput> {
  try {
    const parsed = new URL(url);
    return {
      utmSource: parsed.searchParams.get("utm_source") || undefined,
      utmMedium: parsed.searchParams.get("utm_medium") || undefined,
      utmCampaign: parsed.searchParams.get("utm_campaign") || undefined,
      utmContent: parsed.searchParams.get("utm_content") || undefined,
      utmTerm: parsed.searchParams.get("utm_term") || undefined,
    };
  } catch {
    return {};
  }
}
