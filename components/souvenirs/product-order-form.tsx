"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  productOrderLeadSchema,
  type ProductOrderLeadInput,
} from "@/lib/souvenir-constants";
import { SOUVENIR_PERSONAL_DATA_CONSENT } from "@/lib/souvenir-constants";
import type { SouvenirProduct } from "@/lib/souvenirs-types";
import { trackLeadEvent } from "@/lib/analytics-events";

interface ProductOrderFormProps {
  product: SouvenirProduct;
  sourceType?: ProductOrderLeadInput["sourceType"];
  sourceBlock?: string;
  compact?: boolean;
}

export function ProductOrderForm({
  product,
  sourceType = "product_order",
  sourceBlock = "product-form",
  compact = false,
}: ProductOrderFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(productOrderLeadSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      phone: "",
      telegram: "",
      message: "",
      quantity: 1,
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      productCategory: product.category,
      makerId: product.maker?.id,
      makerSlug: product.maker?.slug,
      makerTitle: product.maker?.title,
      sourceType,
      source: "souvenirs",
      sourceBlock,
      personalDataConsent: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    trackLeadEvent("lead_form_submit", {
      sourceType,
      sourceSlug: product.slug,
      sourceTitle: product.title,
      sourceBlock,
      requestType: "product_order",
      productType: "souvenir",
    });
    try {
      const payload = {
        ...values,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)
          ? values.contact
          : values.email,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Не удалось отправить заявку");
      }
      trackLeadEvent("lead_form_success", {
        sourceType,
        sourceSlug: product.slug,
        sourceBlock,
        requestType: "product_order",
        productType: "souvenir",
      });
      setSuccess(true);
    } catch (err) {
      trackLeadEvent("lead_form_error", {
        sourceType,
        sourceSlug: product.slug,
        sourceBlock,
        requestType: "product_order",
      });
      setServerError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div className="border border-baikal/30 bg-baikal/5 p-6 text-sm leading-relaxed" role="status">
        <p className="font-medium mb-2">Заявка отправлена</p>
        <p className="text-muted-foreground">
          Запрос по «{product.title}» получен. Свяжемся по указанному контакту и
          уточним наличие. Оплата и доставка — по договорённости, без корзины на
          сайте.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "space-y-4" : "space-y-5 border border-border p-6 lg:p-8"}
    >
      {!compact && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Заявка на товар
          </p>
          <p className="text-sm font-medium">Вы выбрали: {product.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Без оплаты на сайте — только запрос, мы ответим лично.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order-name">Имя *</Label>
          <Input id="order-name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive" role="alert">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="order-contact">Контакт для связи *</Label>
          <Input
            id="order-contact"
            placeholder="Telegram, телефон, MAX или email"
            {...form.register("contact")}
          />
          {form.formState.errors.contact && (
            <p className="text-xs text-destructive" role="alert">{form.formState.errors.contact.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-qty">Количество</Label>
          <Input
            id="order-qty"
            type="number"
            min={1}
            max={99}
            inputMode="numeric"
            {...form.register("quantity", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-message">Комментарий</Label>
        <Textarea
          id="order-message"
          rows={compact ? 3 : 4}
          placeholder="Адрес доставки, желаемые сроки, вопросы — по желанию"
          {...form.register("message")}
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="order-consent"
          checked={form.watch("personalDataConsent") === true}
          onCheckedChange={(v) =>
            form.setValue("personalDataConsent", v === true ? true : (undefined as never), {
              shouldValidate: true,
            })
          }
        />
        <Label htmlFor="order-consent" className="text-xs leading-relaxed font-normal">
          {SOUVENIR_PERSONAL_DATA_CONSENT}
        </Label>
      </div>
      {form.formState.errors.personalDataConsent && (
        <p className="text-xs text-destructive" role="alert">
          {form.formState.errors.personalDataConsent.message}
        </p>
      )}

      {serverError && <p className="text-sm text-destructive" role="alert">{serverError}</p>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Отправляем…" : product.orderCtaLabel || "Уточнить наличие"}
      </Button>
    </form>
  );
}
