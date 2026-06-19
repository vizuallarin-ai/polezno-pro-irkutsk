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
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Не удалось отправить заявку");
      }
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div className="border border-baikal/30 bg-baikal/5 p-6 text-sm leading-relaxed">
        <p className="font-medium mb-2">Заявка отправлена</p>
        <p className="text-muted-foreground">
          Мы свяжемся с вами и уточним наличие, сроки и доставку открыток.
        </p>
      </div>
    );
  }

  const ctaLabel =
    sourceType === "ar_postcard_question"
      ? "Отправить вопрос"
      : "Заказать / предзаказ";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 border border-border p-6 lg:p-8"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {sourceType === "ar_postcard_question" ? "Вопрос" : "Предзаказ"}
        </p>
        <p className="text-sm font-medium">{postcard.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Без оплаты на сайте — только запрос.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ar-name">Имя</Label>
          <Input id="ar-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ar-email">Email</Label>
          <Input id="ar-email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ar-phone">Телефон</Label>
          <Input id="ar-phone" {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ar-telegram">Telegram</Label>
          <Input id="ar-telegram" {...form.register("telegram")} />
        </div>
        {sourceType === "ar_postcard_preorder" && (
          <div className="space-y-2">
            <Label htmlFor="ar-qty">Количество</Label>
            <Input
              id="ar-qty"
              type="number"
              min={1}
              max={99}
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
          rows={4}
          placeholder={
            sourceType === "ar_postcard_question"
              ? "Не работает QR, хотите оптом, нужна другая открытка…"
              : "Адрес доставки, желаемые сроки…"
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
        <Label htmlFor="ar-consent" className="text-xs leading-relaxed font-normal">
          {AR_POSTCARD_PERSONAL_DATA_CONSENT}
        </Label>
      </div>
      {form.formState.errors.personalDataConsent && (
        <p className="text-xs text-destructive">
          {form.formState.errors.personalDataConsent.message}
        </p>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {ctaLabel}
      </Button>
    </form>
  );
}
