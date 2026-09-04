"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  publicB2cLeadSchema,
  extractUtmFromUrl,
} from "@/lib/leads-schema";
import { type RequestType } from "@/lib/leads-constants";
import { CTA } from "@/lib/cta-constants";
import { FORM_STARTED_FIELD, HONEYPOT_FIELD } from "@/lib/lead-spam";
import { trackLeadEvent, trackAnalyticsEvent } from "@/lib/analytics-events";

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
  /** Show preferred-contact select (default: hidden on compact B2C). */
  showPreferredMethod?: boolean;
  /** Start with details panel open (dates/people/message). */
  detailsOpenByDefault?: boolean;
  submitLabel?: string;
  consentText?: string;
  consentVersion?: string;
  privacyPolicyUrl?: string;
  requireConsent?: boolean;
  className?: string;
  id?: string;
  /** Messenger fallbacks for error state */
  fallbackTelegram?: string | null;
  fallbackMax?: string | null;
  fallbackEmail?: string | null;
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
  showPreferredMethod = false,
  detailsOpenByDefault = false,
  submitLabel,
  consentText = "Я согласен(на) на обработку персональных данных и понимаю, что со мной свяжутся по указанному контакту",
  consentVersion = "2026-06",
  privacyPolicyUrl = "/privacy",
  requireConsent = true,
  className,
  id = "lead-form",
  fallbackTelegram,
  fallbackMax,
  fallbackEmail,
}: LeadFormProps) {
  const needsQualification = showDate || showPeopleCount || showFormat;
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [detailsOpen, setDetailsOpen] = useState(
    detailsOpenByDefault || Boolean(defaultMessage?.trim()) || needsQualification
  );
  const trackedStart = useRef(false);
  const trackedOpen = useRef(false);

  const form = useForm({
    resolver: zodResolver(publicB2cLeadSchema),
    defaultValues: {
      name: "",
      contact: "",
      message: defaultMessage,
      preferredContactMethod: "any",
      dates: "",
      groupSize: undefined,
      selectedFormat: showFormat ? "guided" : "",
      consentAccepted: false,
    },
  });

  useEffect(() => {
    if (trackedOpen.current) return;
    trackedOpen.current = true;
    trackLeadEvent("lead_form_open", {
      sourceType,
      sourceTitle,
      sourceSlug,
      sourceBlock,
      requestType: defaultRequestType,
    });
  }, [sourceType, sourceTitle, sourceSlug, sourceBlock, defaultRequestType]);

  const markFormStart = () => {
    if (trackedStart.current) return;
    trackedStart.current = true;
    trackAnalyticsEvent("lead_form_start", {
      sourceType,
      sourceTitle,
      sourceSlug,
      sourceBlock,
      requestType: defaultRequestType,
    });
  };

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

  const contextLabel =
    routeContext?.title ||
    productContext?.title ||
    arPostcardContext?.title ||
    materialContext?.title ||
    photoContext?.title;

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center gap-5"
        role="status"
        aria-live="polite"
      >
        <div className="w-14 h-14 rounded-full bg-baikal/10 flex items-center justify-center">
          <Check size={22} className="text-baikal" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Заявка отправлена</h3>
          <p className="type-body-sm text-muted-foreground max-w-sm text-pretty">
            Алёна получит ваш запрос
            {contextLabel ? (
              <>
                {" "}
                по «{contextLabel}»
              </>
            ) : null}{" "}
            и свяжется с вами по указанному контакту. Сейчас ничего дополнительно
            делать не нужно.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={CTA.discovery.href}
            className="cta-label inline-flex h-11 min-h-[44px] items-center justify-center px-5 type-button border border-border text-foreground hover:bg-muted transition-colors"
          >
            {CTA.discovery.label}
          </Link>
          <Link
            href={CTA.mapExplore.href}
            className="cta-label inline-flex h-11 min-h-[44px] items-center justify-center px-5 type-button text-baikal hover:underline"
          >
            {CTA.mapExplore.label}
          </Link>
        </div>
      </div>
    );
  }

  const label =
    submitLabel ||
    (variant === "route" || defaultRequestType === "guided_route"
      ? CTA.guided.label
      : CTA.assist.label);

  const hasMessengerFallback =
    Boolean(fallbackTelegram) || Boolean(fallbackMax) || Boolean(fallbackEmail);

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      onFocusCapture={markFormStart}
      className={cn("flex flex-col gap-5", className)}
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

      {contextLabel && (
        <p className="type-body-sm border border-border bg-muted/40 px-4 py-3 text-foreground text-pretty">
          Вы выбрали: <span className="font-medium">{contextLabel}</span>
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`}>Имя *</Label>
        <Input
          id={`${id}-name`}
          autoComplete="name"
          placeholder="Как к вам обращаться"
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
          autoComplete="tel"
          inputMode="text"
          placeholder="Telegram, телефон, MAX или email"
          {...form.register("contact")}
        />
        {form.formState.errors.contact && (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.contact.message}
          </p>
        )}
      </div>

      {showPreferredMethod && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-method`}>Как удобнее связаться</Label>
          <select
            id={`${id}-method`}
            className="flex h-10 w-full border border-border bg-background px-3 text-sm"
            {...form.register("preferredContactMethod")}
          >
            <option value="any">Любой</option>
            <option value="telegram">Telegram</option>
            <option value="max">MAX</option>
            <option value="email">Email</option>
            <option value="phone">Телефон</option>
          </select>
        </div>
      )}

      <div className="border border-border">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 type-ui-label text-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
          aria-expanded={detailsOpen}
        >
          Уточнить детали
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform text-muted-foreground",
              detailsOpen && "rotate-180"
            )}
          />
        </button>
        {detailsOpen && (
          <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
            {showDate && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-dates`}>Когда примерно</Label>
                <Input
                  id={`${id}-dates`}
                  placeholder="Например: 12–15 июля или выходные"
                  {...form.register("dates")}
                />
              </div>
            )}
            {showPeopleCount && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-group`}>Сколько человек</Label>
                <Input
                  id={`${id}-group`}
                  type="number"
                  min={1}
                  inputMode="numeric"
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
                  <option value="guided">С Алёной</option>
                  <option value="self-guided">Самостоятельно</option>
                  <option value="corporate">Для компании</option>
                  <option value="undecided">Пока не знаю</option>
                </select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-message`}>Короткий комментарий</Label>
              <Textarea
                id={`${id}-message`}
                rows={3}
                placeholder="Что важно учесть — по желанию"
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>
          </div>
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
            className="type-caption text-muted-foreground leading-relaxed font-normal cursor-pointer text-pretty"
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
        <div
          className="flex flex-col gap-3 border border-destructive/30 bg-destructive/5 px-4 py-3"
          role="alert"
        >
          <p className="type-body-sm text-destructive">{serverError}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                void onSubmit();
              }}
              className="type-ui-label text-foreground underline underline-offset-2 min-h-[44px]"
            >
              Повторить отправку
            </button>
            {hasMessengerFallback && (
              <span className="type-caption text-muted-foreground self-center">
                Или напишите напрямую:
              </span>
            )}
            {fallbackTelegram && (
              <a
                href={fallbackTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="type-ui-label text-baikal hover:underline min-h-[44px] inline-flex items-center"
              >
                Telegram
              </a>
            )}
            {fallbackMax && (
              <a
                href={fallbackMax}
                target="_blank"
                rel="noopener noreferrer"
                className="type-ui-label text-baikal hover:underline min-h-[44px] inline-flex items-center"
              >
                MAX
              </a>
            )}
            {fallbackEmail && (
              <a
                href={`mailto:${fallbackEmail}`}
                className="type-ui-label text-baikal hover:underline min-h-[44px] inline-flex items-center"
              >
                Email
              </a>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="cta-label cta-label-wrap-sm cta-primary type-button disabled:opacity-60 w-full sm:w-auto"
      >
        {form.formState.isSubmitting ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : null}
        {form.formState.isSubmitting ? "Отправляем…" : label}
      </button>
    </form>
  );
}
