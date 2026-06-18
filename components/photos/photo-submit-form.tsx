"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PHOTO_MODERATION_CONSENT_TEXT,
  PHOTO_PERSONAL_DATA_CONSENT_TEXT,
  PHOTO_RIGHTS_CONSENT_TEXT,
} from "@/lib/photo-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  name: z.string().min(2, "Укажите имя"),
  contact: z.string().min(3, "Укажите контакт"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  year: z.string().optional(),
  period: z.string().optional(),
  street: z.string().optional(),
  place: z.string().optional(),
  description: z.string().min(10, "Кратко опишите, что на фото"),
  authorName: z.string().optional(),
  sourceName: z.string().optional(),
  comment: z.string().optional(),
  rightsConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно подтвердить права на фото",
  }),
  moderationConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно согласие на модерацию",
  }),
  personalDataConsent: z.boolean().refine((v) => v === true, {
    message: "Нужно согласие на обработку данных",
  }),
});

type FormValues = z.infer<typeof schema>;

export function PhotoSubmitForm() {
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      year: "",
      period: "",
      street: "",
      place: "",
      description: "",
      authorName: "",
      sourceName: "",
      comment: "",
      rightsConsent: false,
      moderationConsent: false,
      personalDataConsent: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!file) {
      setServerError("Прикрепите фото (JPG, PNG или WebP, до 10 МБ).");
      return;
    }

    setLoading(true);
    setServerError(null);

    const body = new FormData();
    body.append("file", file);
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        body.append(key, value ? "true" : "false");
      } else if (value) {
        body.append(key, String(value));
      }
    });

    try {
      const res = await fetch("/api/photos/submit", { method: "POST", body });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Не удалось отправить фото.");
      }
      setSuccess(true);
      form.reset();
      setFile(null);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Ошибка отправки.");
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div className="border border-border bg-card p-8 text-center space-y-3">
        <p className="text-lg font-medium">Спасибо!</p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Фото отправлено на модерацию. Если потребуется уточнение, мы свяжемся
          с вами по указанному контакту.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Имя *</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Контакт (Telegram / телефон) *</Label>
          <Input id="contact" {...form.register("contact")} />
          {form.formState.errors.contact ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.contact.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo-file">Фото *</Label>
        <Input
          id="photo-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted-foreground">JPG, PNG или WebP, до 10 МБ</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Год (если знаете)</Label>
          <Input id="year" inputMode="numeric" {...form.register("year")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period">Период</Label>
          <Input id="period" placeholder="например, 1990-е" {...form.register("period")} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street">Улица</Label>
          <Input id="street" {...form.register("street")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="place">Место</Label>
          <Input id="place" {...form.register("place")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Что изображено *</Label>
        <Textarea id="description" rows={4} {...form.register("description")} />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="authorName">Автор фото</Label>
          <Input id="authorName" {...form.register("authorName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceName">Источник</Label>
          <Input id="sourceName" {...form.register("sourceName")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Комментарий</Label>
        <Textarea id="comment" rows={2} {...form.register("comment")} />
      </div>

      <div className="space-y-4 border border-border p-4 bg-muted/30">
        <ConsentField
          id="rightsConsent"
          label={PHOTO_RIGHTS_CONSENT_TEXT}
          checked={form.watch("rightsConsent")}
          onCheckedChange={(v) =>
            form.setValue("rightsConsent", v === true, { shouldValidate: true })
          }
          error={form.formState.errors.rightsConsent?.message}
        />
        <ConsentField
          id="moderationConsent"
          label={PHOTO_MODERATION_CONSENT_TEXT}
          checked={form.watch("moderationConsent")}
          onCheckedChange={(v) =>
            form.setValue("moderationConsent", v === true, { shouldValidate: true })
          }
          error={form.formState.errors.moderationConsent?.message}
        />
        <ConsentField
          id="personalDataConsent"
          label={PHOTO_PERSONAL_DATA_CONSENT_TEXT}
          checked={form.watch("personalDataConsent")}
          onCheckedChange={(v) =>
            form.setValue("personalDataConsent", v === true, {
              shouldValidate: true,
            })
          }
          error={form.formState.errors.personalDataConsent?.message}
        />
      </div>

      {serverError ? (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="h-11 px-8">
        {loading ? "Отправка…" : "Отправить на модерацию"}
      </Button>
    </form>
  );
}

function ConsentField({
  id,
  label,
  checked,
  onCheckedChange,
  error,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex gap-3 items-start cursor-pointer">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm leading-relaxed text-muted-foreground">{label}</span>
      </label>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
