"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

export interface BusinessFormProps {
  initialTaskType?: string;
  initialRouteSlug?: string;
  initialExcursionSlug?: string;
  initialSourceBlock?: string;
  initialMessage?: string;
  id?: string;
}

export function BusinessForm({
  initialTaskType,
  initialRouteSlug,
  initialExcursionSlug,
  initialSourceBlock = "form",
  initialMessage = "",
  id = "business-form",
}: BusinessFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

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
          ...(initialRouteSlug && { routeSlug: initialRouteSlug }),
          ...(initialExcursionSlug && { excursionSlug: initialExcursionSlug }),
          ...(initialRouteSlug && { selectedFormat: "corporate" }),
          groupSize: data.peopleCount,
          budget: data.budgetRange || undefined,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSubmitted(true);
    } catch {
      alert("Ошибка отправки. Попробуйте позже или напишите на контакты страницы.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-6 border border-border bg-card p-8">
        <div className="w-16 h-16 rounded-full bg-baikal/10 flex items-center justify-center">
          <Check size={24} className="text-baikal" />
        </div>
        <div>
          <h2 className="text-2xl font-light mb-2">Заявка отправлена</h2>
          <p className="text-muted-foreground max-w-sm">
            Вернёмся с ответом в течение рабочего дня. Если задача срочная —
            продублируйте даты в мессенджере из контактов.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 border border-border bg-card p-6 lg:p-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2 sm:col-span-1">
          <Label htmlFor={`${id}-name`}>Имя *</Label>
          <Input id={`${id}-name`} placeholder="Как к вам обращаться" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-1">
          <Label htmlFor={`${id}-company`}>Компания / проект *</Label>
          <Input
            id={`${id}-company`}
            placeholder="Отель, агентство, компания"
            {...register("company")}
          />
          {errors.company && (
            <p className="text-xs text-destructive">{errors.company.message}</p>
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
          <p className="text-xs text-destructive">{errors.contact.message}</p>
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
          <p className="text-xs text-destructive">{errors.taskType.message}</p>
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
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
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
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-phone`}>Телефон</Label>
            <Input id={`${id}-phone`} type="tel" {...register("phone")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-telegram`}>Telegram</Label>
            <Input id={`${id}-telegram`} placeholder="@username" {...register("telegram")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-max`}>MAX</Label>
            <Input id={`${id}-max`} {...register("max")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-dates`}>Планируемые даты</Label>
            <Input id={`${id}-dates`} placeholder="например, 12–14 сентября" {...register("dates")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-peopleCount`}>Количество человек</Label>
            <Input
              id={`${id}-peopleCount`}
              type="number"
              min={1}
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
            {errors.websiteUrl && (
              <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 items-center justify-center gap-2 bg-baikal text-white px-8 text-sm font-medium hover:bg-baikal-light transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 w-full sm:w-auto"
      >
        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
        {isSubmitting ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
