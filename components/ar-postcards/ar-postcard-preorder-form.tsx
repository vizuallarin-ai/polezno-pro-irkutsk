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
  AR_POSTCARD_PERSONAL_DATA_CONSENT,
  arPostcardPreorderLeadSchema,
  type ArPostcardPreorderLeadInput,
} from "@/lib/ar-postcard-constants";
import type { PublicArPostcard } from "@/types/ar-postcards";
import { trackLeadEvent } from "@/lib/analytics-events";

interface ArPostcardPreorderFormProps {
  postcard: PublicArPostcard;
  sourceType?: ArPostcardPreorderLeadInput["sourceType"];
  sourceBlock?: string;
}

export function ArPostcardPreorderForm({
  postcard,
  sourceType = "ar_postcard_preorder",
  sourceBlock = "postcard-preorder",
}: ArPostcardPreorderFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(arPostcardPreorderLeadSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      phone: "",
      telegram: "",
      message: "",
      quantity: 1,
      arPostcardSlug: postcard.slug,
      arPostcardTitle: postcard.title,
      relatedProductId: postcard.relatedProduct?.id,
      productSlug: postcard.relatedProduct?.slug,
      productTitle: postcard.relatedProduct?.title,
      sourceType,
      source: "ar_postcards",
      sourceBlock,
      personalDataConsent: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    trackLeadEvent("lead_form_submit", {
      sourceType,
      sourceSlug: postcard.slug,
      sourceTitle: postcard.title,
      sourceBlock,
      requestType: sourceType,
      productType: "ar_postcard",
    });
    try {
      const payload = {
        ...values,
        email: values.contact.includes("@") ? values.contact : values.email,
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
        sourceSlug: postcard.slug,
        sourceBlock,
        requestType: sourceType,
        productType: "ar_postcard",
      });
      setSuccess(true);
    } catch (err) {
      trackLeadEvent("lead_form_error", {
        sourceType,
        sourceSlug: postcard.slug,
        sourceBlock,
        requestType: sourceType,
      });
      setServerError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div
        className="border border-baikal/30 bg-baikal/5 p-6 text-sm leading-relaxed"
        role="status"
      >
        <p className="font-medium mb-2">Заявка отправлена</p>
        <p className="text-muted-foreground">
          Запрос по «{postcard.title}» получен. Свяжемся по указанному контакту и
          уточним наличие, сроки и доставку.
        </p>
      </div>
    );
  }

  const ctaLabel =
    sourceType === "ar_postcard_question"
      ? "Отправить вопрос"
      : "Написать об открытке";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 border border-border p-6 lg:p-8"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {sourceType === "ar_postcard_question" ? "Вопрос" : "Предзаказ"}
        </p>
        <p className="text-sm font-medium">Вы выбрали: {postcard.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Без оплаты на сайте — только запрос.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ar-name">Имя *</Label>
          <Input id="ar-name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ar-contact">Контакт для связи *</Label>
          <Input
            id="ar-contact"
            placeholder="Telegram, телефон, MAX или email"
            {...form.register("contact")}
          />
          {form.formState.errors.contact && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.contact.message}
            </p>
          )}
        </div>
        {sourceType === "ar_postcard_preorder" && (
          <div className="space-y-2">
            <Label htmlFor="ar-qty">Количество</Label>
            <Input
              id="ar-qty"
              type="number"
              min={1}
              max={99}
              inputMode="numeric"
              {...form.register("quantity", { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ar-message">
          {sourceType === "ar_postcard_question" ? "Вопрос" : "Комментарий"}
        </Label>
        <Textarea
          id="ar-message"
          rows={3}
          placeholder={
            sourceType === "ar_postcard_question"
              ? "Не работает QR, хотите оптом…"
              : "По желанию"
          }
          {...form.register("message")}
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="ar-consent"
          checked={form.watch("personalDataConsent") === true}
          onCheckedChange={(v) =>
            form.setValue(
              "personalDataConsent",
              v === true ? true : (undefined as never),
              { shouldValidate: true }
            )
          }
        />
        <Label
          htmlFor="ar-consent"
          className="text-xs leading-relaxed font-normal"
        >
          {AR_POSTCARD_PERSONAL_DATA_CONSENT}
        </Label>
      </div>
      {form.formState.errors.personalDataConsent && (
        <p className="text-xs text-destructive" role="alert">
          {form.formState.errors.personalDataConsent.message}
        </p>
      )}

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Отправляем…" : ctaLabel}
      </Button>
    </form>
  );
}
