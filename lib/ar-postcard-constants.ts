import { z } from "zod";

export const AR_POSTCARD_EFFECT_TYPES = [
  "video_page",
  "animated_image",
  "audio_story",
  "webar_link",
  "external_ar_service",
  "coming_soon",
] as const;

export type ArPostcardEffectType = (typeof AR_POSTCARD_EFFECT_TYPES)[number];

export const AR_POSTCARD_EFFECT_LABELS: Record<ArPostcardEffectType, string> = {
  video_page: "Видео на странице",
  animated_image: "Анимированное изображение",
  audio_story: "Аудиоистория",
  webar_link: "WebAR (внешняя ссылка)",
  external_ar_service: "Внешний AR-сервис",
  coming_soon: "Скоро",
};

export const AR_POSTCARD_EFFECT_OPTIONS = AR_POSTCARD_EFFECT_TYPES.map((value) => ({
  label: AR_POSTCARD_EFFECT_LABELS[value],
  value,
}));

export const AR_POSTCARD_PERSONAL_DATA_CONSENT =
  "Я согласен(на) на обработку персональных данных для ответа на заявку.";

export const arPostcardPreorderLeadSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  message: z.string().optional(),
  quantity: z.number().min(1).max(99).optional(),
  arPostcardSlug: z.string().min(1),
  arPostcardTitle: z.string().min(1),
  relatedProductId: z.string().optional(),
  productSlug: z.string().optional(),
  productTitle: z.string().optional(),
  sourceType: z.enum(["ar_postcard_preorder", "ar_postcard_question"]),
  source: z.string().optional(),
  sourceBlock: z.string().optional(),
  personalDataConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно согласие на обработку данных",
  }),
});

export type ArPostcardPreorderLeadInput = z.infer<typeof arPostcardPreorderLeadSchema>;

export function isExternalEffectType(effectType: ArPostcardEffectType): boolean {
  return effectType === "webar_link" || effectType === "external_ar_service";
}
