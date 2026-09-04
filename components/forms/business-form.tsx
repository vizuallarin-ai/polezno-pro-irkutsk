"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BUSINESS_BUDGET_OPTIONS,
  BUSINESS_FORMAT_OPTIONS,
  BUSINESS_TASK_TYPE_OPTIONS,
  businessLeadSchema,
  type BusinessLeadInput,
} from "@/lib/leads-business";
import { CTA } from "@/lib/cta-constants";
import { FORM_STARTED_FIELD, HONEYPOT_FIELD } from "@/lib/lead-spam";
import { trackLeadEvent } from "@/lib/analytics-events";

export interface BusinessFormProps {
  initialTaskType?: string;
  initialRouteSlug?: string;
  initialExcursionSlug?: string;
  initialSourceBlock?: string;
  initialMessage?: string;
  id?: string;
  fallbackTelegram?: string | null;
  fallbackMax?: string | null;
  fallbackEmail?: string | null;
}

export function BusinessForm({
  initialTaskType,
  initialRouteSlug,
  initialExcursionSlug,
  initialSourceBlock = "form",
  initialMessage = "",
  id = "business-form",
  fallbackTelegram,
  fallbackMax,
  fallbackEmail,
}: BusinessFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(businessLeadSchema),
    defaultValues: {
      name: "",
      company: "",
      contact: "",
      taskType:
        (initialTaskType as BusinessLeadInput["taskType"]) ||
        (initialRouteSlug ? "route_program" : ""),
      message: initialMessage,
      email: "",
      telegram: "",
      max: "",
      phone: "",
      dates: "",
      businessFormat: "",
      budgetRange: "",
      websiteUrl: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerError(null);
    trackLeadEvent("lead_form_submit", {
      sourceType: "business",
      sourceBlock: initialSourceBlock,
      requestType: "business_request",
    });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: "business",
          sourceType: "business",
          sourceTitle: "Для бизнеса",
          sourceBlock: initialSourceBlock,
          requestType: "business_request",
          ...(initialRouteSlug && { routeSlug: initialRouteSlug }),
          ...(initialExcursionSlug && { excursionSlug: initialExcursionSlug }),
          ...(initialRouteSlug && { selectedFormat: "corporate" }),
          groupSize: data.peopleCount,
          budget: data.budgetRange || undefined,
          [FORM_STARTED_FIELD]: startedAt,
          [HONEYPOT_FIELD]: "",
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      trackLeadEvent("lead_form_success", {
        sourceType: "business",
        sourceBlock: initialSourceBlock,
        requestType: "business_request",
      });
      setSubmitted(true);
    } catch {
      trackLeadEvent("lead_form_error", {
        sourceType: "business",
        sourceBlock: initialSourceBlock,
        requestType: "business_request",
      });
      setServerError(
        "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center gap-6 bg-card/80 p-8"
        role="status"
      >
        <div className="w-16 h-16 rounded-full bg-baikal/10 flex items-center justify-center">
          <Check size={24} className="text-baikal" />
        </div>
        <div>
          <h2 className="text-2xl font-light mb-2">Заявка отправлена</h2>
          <p className="text-muted-foreground max-w-sm text-pretty">
            Получили запрос по программе. Свяжемся по указанному контакту, чтобы
            уточнить задачу и предложить формат. Сейчас ничего дополнительно
            делать не нужно.
          </p>
        </div>
        <Link
          href={CTA.discovery.href}
          className="type-button text-baikal hover:underline min-h-[44px] inline-flex items-center"
        >
          {CTA.discovery.label}
        </Link>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 bg-card/80 p-6 lg:p-8"
    >
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
        name={HONEYPOT_FIELD}
        defaultValue=""
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name`}>Имя *</Label>
          <Input
            id={`${id}-name`}
            autoComplete="name"
            placeholder="Как к вам обращаться"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-company`}>Компания / проект *</Label>
          <Input
            id={`${id}-company`}
            autoComplete="organization"
            placeholder="Отель, агентство, компания"
            {...register("company")}
          />
          {errors.company && (
            <p className="text-xs text-destructive" role="alert">
              {errors.company.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-contact`}>Контакт для связи *</Label>
        <Input
          id={`${id}-contact`}
          placeholder="Телефон, email или @username"
          {...register("contact")}
        />
        {errors.contact && (
          <p className="text-xs text-destructive" role="alert">
            {errors.contact.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-taskType`}>Тип задачи *</Label>
        <select
          id={`${id}-taskType`}
          className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
          {...register("taskType")}
        >
          <option value="">Выберите направление</option>
          {BUSINESS_TASK_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.taskType && (
          <p className="text-xs text-destructive" role="alert">
            {errors.taskType.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-message`}>Опишите задачу *</Label>
        <Textarea
          id={`${id}-message`}
          rows={5}
          placeholder="Даты, состав группы, цель визита, что уже продумано…"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="inline-flex items-center gap-2 type-body-sm text-muted-foreground hover:text-foreground transition-colors w-fit min-h-[44px]"
        aria-expanded={showOptional}
      >
        <ChevronDown
          size={14}
          className={cn("transition-transform", showOptional && "rotate-180")}
        />
        Дополнительные поля
      </button>

      {showOptional && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input id={`${id}-email`} type="email" {...register("email")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-phone`}>Телефон</Label>
            <Input id={`${id}-phone`} type="tel" {...register("phone")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-telegram`}>Telegram</Label>
            <Input
              id={`${id}-telegram`}
              placeholder="@username"
              {...register("telegram")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-max`}>MAX</Label>
            <Input id={`${id}-max`} {...register("max")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-dates`}>Планируемые даты</Label>
            <Input
              id={`${id}-dates`}
              placeholder="например, 12–14 сентября"
              {...register("dates")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-peopleCount`}>Количество человек</Label>
            <Input
              id={`${id}-peopleCount`}
              type="number"
              min={1}
              inputMode="numeric"
              {...register("peopleCount", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-businessFormat`}>Формат</Label>
            <select
              id={`${id}-businessFormat`}
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
              {...register("businessFormat")}
            >
              <option value="">Не выбрано</option>
              {BUSINESS_FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-budgetRange`}>Ориентир по бюджету</Label>
            <select
              id={`${id}-budgetRange`}
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
              {...register("budgetRange")}
            >
              <option value="">Не выбрано</option>
              {BUSINESS_BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={`${id}-websiteUrl`}>Сайт компании</Label>
            <Input
              id={`${id}-websiteUrl`}
              type="url"
              placeholder="https://"
              {...register("websiteUrl")}
            />
          </div>
        </div>
      )}

      {serverError && (
        <div
          className="flex flex-col gap-2 border border-destructive/30 bg-destructive/5 px-4 py-3"
          role="alert"
        >
          <p className="type-body-sm text-destructive">{serverError}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                void handleSubmit(onSubmit)();
              }}
              className="type-ui-label text-foreground underline underline-offset-2 min-h-[44px]"
            >
              Повторить отправку
            </button>
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
        disabled={isSubmitting}
        className="cta-label inline-flex h-12 min-h-[44px] items-center justify-center gap-2 bg-baikal text-white px-8 type-button hover:bg-baikal-light transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 w-full sm:w-auto"
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
        {isSubmitting ? "Отправляем…" : CTA.b2bPrimary.label}
      </button>
    </form>
  );
}
