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
          Мы свяжемся с вами по указанному контакту и уточним детали заказа.
          Оплата и доставка — по договорённости, без корзины на сайте.
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
          <p className="text-sm font-medium">{product.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Без оплаты на сайте — только запрос, мы ответим лично.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order-name">Имя</Label>
          <Input id="order-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-email">Email</Label>
          <Input id="order-email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-phone">Телефон</Label>
          <Input id="order-phone" {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-telegram">Telegram</Label>
          <Input id="order-telegram" {...form.register("telegram")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-qty">Количество</Label>
          <Input
            id="order-qty"
            type="number"
            min={1}
            max={99}
            {...form.register("quantity", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-message">Комментарий</Label>
        <Textarea
          id="order-message"
          rows={compact ? 3 : 4}
          placeholder="Адрес доставки, желаемые сроки, вопросы…"
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
        <p className="text-xs text-destructive">
          {form.formState.errors.personalDataConsent.message}
        </p>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {product.orderCtaLabel}
      </Button>
    </form>
  );
}
