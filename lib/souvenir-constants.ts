import { z } from "zod";

export const SOUVENIR_PERSONAL_DATA_CONSENT =
  "Я согласен(на) на обработку персональных данных для ответа на заявку.";

export const MAKER_PLACEMENT_CONSENT =
  "Подтверждаю, что информация достоверна и я имею право на размещение материалов.";

export const MAKER_ADVERTISING_CONSENT =
  "Понимаю, что размещение в каталоге может требовать рекламной пометки по закону.";

export const productOrderLeadSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  message: z.string().optional(),
  quantity: z.number().min(1).max(99).optional(),
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  productTitle: z.string().optional(),
  productCategory: z.string().optional(),
  makerId: z.string().optional(),
  makerSlug: z.string().optional(),
  makerTitle: z.string().optional(),
  sourceType: z.enum(["product_order", "product_question", "souvenir_general"]),
  source: z.string().optional(),
  sourceBlock: z.string().optional(),
  personalDataConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно согласие на обработку данных",
  }),
});

export const makerPlacementLeadSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  contact: z.string().min(3, "Укажите контакт"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  craftType: z.string().min(1, "Укажите направление"),
  city: z.string().optional(),
  district: z.string().optional(),
  websiteUrl: z.string().optional(),
  telegram: z.string().optional(),
  instagram: z.string().optional(),
  shortDescription: z.string().min(20, "Кратко опишите, чем занимаетесь"),
  placementType: z.string().optional(),
  message: z.string().optional(),
  sourceType: z.literal("maker_placement"),
  source: z.string().optional(),
  sourceBlock: z.string().optional(),
  placementConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно подтвердить достоверность",
  }),
  advertisingConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно подтвердить понимание пометки",
  }),
  personalDataConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно согласие на обработку данных",
  }),
});

export type ProductOrderLeadInput = z.infer<typeof productOrderLeadSchema>;
export type MakerPlacementLeadInput = z.infer<typeof makerPlacementLeadSchema>;
