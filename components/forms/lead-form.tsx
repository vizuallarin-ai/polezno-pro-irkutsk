"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  compactLeadSchema,
  fullLeadSchema,
  extractUtmFromUrl,
  type CompactLeadInput,
} from "@/lib/leads-schema";
import {
  PREFERRED_CONTACT_OPTIONS,
  type RequestType,
} from "@/lib/leads-constants";
import { FORM_STARTED_FIELD, HONEYPOT_FIELD } from "@/lib/lead-spam";
import { trackLeadEvent } from "@/lib/analytics-events";

export type LeadFormVariant =
  | "compact"
  | "full"
  | "route"
  | "business"
  | "product"
  | "ar_postcard"
  | "contact";

export interface LeadFormProps {
  variant?: LeadFormVariant;
  sourceType?: string;
  sourceSlug?: string;
  sourceTitle?: string;
  sourceId?: string;
  sourceBlock?: string;
  defaultRequestType?: RequestType;
  defaultMessage?: string;
  routeContext?: { id?: string; slug?: string; title?: string };
  productContext?: {
    id?: string;
    slug?: string;
    title?: string;
    makerId?: string;
  };
  materialContext?: { id?: string; slug?: string; title?: string };
  photoContext?: { id?: string; title?: string };
  arPostcardContext?: { id?: string; slug?: string; title?: string };
  showDate?: boolean;
  showPeopleCount?: boolean;
  showFormat?: boolean;
  submitLabel?: string;
  consentText?: string;
  consentVersion?: string;
  privacyPolicyUrl?: string;
  requireConsent?: boolean;
  className?: string;
  id?: string;
}

export function LeadForm({
  variant = "compact",
  sourceType,
  sourceSlug,
  sourceTitle,
  sourceId,
  sourceBlock = "form",
  defaultRequestType = "general_contact",
  defaultMessage = "",
  routeContext,
  productContext,
  materialContext,
  photoContext,
  arPostcardContext,
  showDate = false,
  showPeopleCount = false,
  showFormat = false,
  submitLabel,
  consentText = "Я согласен(на) на обработку персональных данных и понимаю, что со мной свяжутся по указанному контакту",
  consentVersion = "2026-06",
  privacyPolicyUrl = "/privacy",
  requireConsent = true,
  className,
  id = "lead-form",
}: LeadFormProps) {
  const isFull = variant !== "compact";
  const schema = isFull && requireConsent ? fullLeadSchema : compactLeadSchema;
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contact: "",
      message: defaultMessage,
      preferredContactMethod: "any",
      dates: "",
      groupSize: undefined,
      selectedFormat: "",
      consentAccepted: false,
    },
  });

  useEffect(() => {
    trackLeadEvent("lead_form_open", {
      sourceType,
      sourceTitle,
      sourceSlug,
      sourceBlock,
      requestType: defaultRequestType,
    });
  }, [sourceType, sourceTitle, sourceSlug, sourceBlock, defaultRequestType]);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    trackLeadEvent("lead_form_submit", {
      sourceType,
      sourceTitle,
      sourceSlug,
      sourceBlock,
      requestType: defaultRequestType,
    });

    const utm =
      typeof window !== "undefined"
        ? extractUtmFromUrl(window.location.href)
        : {};

    const payload: Record<string, unknown> = {
      ...values,
      ...utm,
      sourceType,
      sourceSlug,
      sourceTitle,
      sourceId,
      sourceBlock,
      requestType: defaultRequestType,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      consentText: values.consentAccepted ? consentText : undefined,
      consentVersion: values.consentAccepted ? consentVersion : undefined,
      [FORM_STARTED_FIELD]: startedAt,
      [HONEYPOT_FIELD]: "",
      routeId: routeContext?.id,
      routeSlug: routeContext?.slug,
      routeTitle: routeContext?.title,
      materialId: materialContext?.id,
      materialSlug: materialContext?.slug,
      productId: productContext?.id,
      productSlug: productContext?.slug,
      productTitle: productContext?.title,
      makerId: productContext?.makerId,
      photoId: photoContext?.id,
      arPostcardId: arPostcardContext?.id,
      arPostcardSlug: arPostcardContext?.slug,
      source: sourceType,
    };

    if (values.contact?.includes("@") && !values.email) {
      payload.email = values.contact;
    }

    try {
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
        sourceTitle,
        sourceSlug,
        sourceBlock,
        requestType: defaultRequestType,
      });
      setSubmitted(true);
    } catch (err) {
      trackLeadEvent("lead_form_error", {
        sourceType,
        sourceBlock,
        requestType: defaultRequestType,
      });
      setServerError(
        err instanceof Error
          ? err.message
          : "Не удалось отправить заявку. Попробуйте ещё раз"
      );
    }
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-baikal/10 flex items-center justify-center">
          <Check size={22} className="text-baikal" />
        </div>
        <div>
          <h3 className="text-lg font-light mb-1">Спасибо</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Заявка отправлена. Мы свяжемся с вами по указанному контакту.
          </p>
        </div>
      </div>
    );
  }

  const label =
    submitLabel ||
    (isFull ? "Отправить заявку" : "Написать");

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-6", className)}
      noValidate
    >
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
        {...form.register(HONEYPOT_FIELD)}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`}>Имя *</Label>
        <Input
          id={`${id}-name`}
          placeholder="Ваше имя"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-contact`}>Контакт для связи *</Label>
        <Input
          id={`${id}-contact`}
          placeholder="Telegram, email или телефон"
          {...form.register("contact")}
        />
        {form.formState.errors.contact && (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.contact.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-method`}>Как удобнее связаться</Label>
        <select
          id={`${id}-method`}
          className="flex h-10 w-full border border-border bg-background px-3 text-sm"
          {...form.register("preferredContactMethod")}
        >
          {PREFERRED_CONTACT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showDate && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-dates`}>Планируемые даты</Label>
          <Input
            id={`${id}-dates`}
            placeholder="Например: 12–15 июля"
            {...form.register("dates")}
          />
        </div>
      )}

      {showPeopleCount && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-group`}>Количество человек</Label>
          <Input
            id={`${id}-group`}
            type="number"
            min={1}
            {...form.register("groupSize", { valueAsNumber: true })}
          />
        </div>
      )}

      {showFormat && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-format`}>Формат</Label>
          <select
            id={`${id}-format`}
            className="flex h-10 w-full border border-border bg-background px-3 text-sm"
            {...form.register("selectedFormat")}
          >
            <option value="">Выберите формат</option>
            <option value="self-guided">Самостоятельно</option>
            <option value="guided">С Алёной</option>
            <option value="corporate">Для компании</option>
            <option value="undecided">Пока не знаю</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-message`}>
          Сообщение{isFull ? " *" : ""}
        </Label>
        <Textarea
          id={`${id}-message`}
          rows={isFull ? 5 : 3}
          placeholder="Расскажите, чем мы можем помочь…"
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      {requireConsent && (
        <div className="flex items-start gap-3">
          <Checkbox
            id={`${id}-consent`}
            checked={Boolean(form.watch("consentAccepted"))}
            onCheckedChange={(v) =>
              form.setValue("consentAccepted", v === true, {
                shouldValidate: true,
              })
            }
          />
          <Label
            htmlFor={`${id}-consent`}
            className="text-xs text-muted-foreground leading-relaxed font-normal cursor-pointer"
          >
            {consentText}{" "}
            <Link
              href={privacyPolicyUrl}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Политика конфиденциальности
            </Link>
          </Label>
        </div>
      )}
      {"consentAccepted" in form.formState.errors &&
        form.formState.errors.consentAccepted && (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.consentAccepted.message}
          </p>
        )}

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex h-12 items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 w-full sm:w-auto"
      >
        {form.formState.isSubmitting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : null}
        {form.formState.isSubmitting ? "Отправляем…" : label}
      </button>
    </form>
  );
}
