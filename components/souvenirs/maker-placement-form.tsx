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
import { MAKER_CRAFT_OPTIONS } from "@/lib/content-labels";
import {
  MAKER_ADVERTISING_CONSENT,
  MAKER_PLACEMENT_CONSENT,
  makerPlacementLeadSchema,
  SOUVENIR_PERSONAL_DATA_CONSENT,
  type MakerPlacementLeadInput,
} from "@/lib/souvenir-constants";

export function MakerPlacementForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(makerPlacementLeadSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      craftType: "",
      city: "Иркутск",
      district: "",
      websiteUrl: "",
      telegram: "",
      instagram: "",
      shortDescription: "",
      placementType: "catalog",
      message: "",
      sourceType: "maker_placement",
      source: "souvenirs",
      sourceBlock: "submit-maker",
      placementConsent: undefined,
      advertisingConsent: undefined,
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
      <div className="border border-baikal/30 bg-baikal/5 p-6 text-sm leading-relaxed max-w-2xl">
        <p className="font-medium mb-2">Заявка принята</p>
        <p className="text-muted-foreground">
          Мы рассмотрим материалы и свяжемся с вами. Размещение в каталоге —
          после модерации, без автоматической публикации.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl border border-border p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maker-name">Имя / мастерская</Label>
          <Input id="maker-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maker-contact">Контакт для связи</Label>
          <Input id="maker-contact" {...form.register("contact")} />
          {form.formState.errors.contact && (
            <p className="text-xs text-destructive">{form.formState.errors.contact.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maker-email">Email</Label>
          <Input id="maker-email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="maker-craft">Направление</Label>
          <select
            id="maker-craft"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.watch("craftType")}
            onChange={(e) =>
              form.setValue("craftType", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Выберите направление</option>
            {MAKER_CRAFT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {form.formState.errors.craftType && (
            <p className="text-xs text-destructive">{form.formState.errors.craftType.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maker-city">Город</Label>
          <Input id="maker-city" {...form.register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maker-district">Район</Label>
          <Input id="maker-district" {...form.register("district")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maker-telegram">Telegram</Label>
          <Input id="maker-telegram" {...form.register("telegram")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maker-site">Сайт</Label>
          <Input id="maker-site" {...form.register("websiteUrl")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maker-desc">Кратко о вас и изделиях</Label>
        <Textarea
          id="maker-desc"
          rows={4}
          {...form.register("shortDescription")}
        />
        {form.formState.errors.shortDescription && (
          <p className="text-xs text-destructive">
            {form.formState.errors.shortDescription.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maker-message">Дополнительно</Label>
        <Textarea
          id="maker-message"
          rows={3}
          placeholder="Ссылки на портфолио, желаемый формат размещения…"
          {...form.register("message")}
        />
      </div>

      <div className="space-y-3">
        <ConsentRow
          id="placement-consent"
          label={MAKER_PLACEMENT_CONSENT}
          checked={form.watch("placementConsent") === true}
          onChange={(v) =>
            form.setValue("placementConsent", v ? true : (undefined as never), {
              shouldValidate: true,
            })
          }
          error={form.formState.errors.placementConsent?.message}
        />
        <ConsentRow
          id="advertising-consent"
          label={MAKER_ADVERTISING_CONSENT}
          checked={form.watch("advertisingConsent") === true}
          onChange={(v) =>
            form.setValue("advertisingConsent", v ? true : (undefined as never), {
              shouldValidate: true,
            })
          }
          error={form.formState.errors.advertisingConsent?.message}
        />
        <ConsentRow
          id="personal-consent"
          label={SOUVENIR_PERSONAL_DATA_CONSENT}
          checked={form.watch("personalDataConsent") === true}
          onChange={(v) =>
            form.setValue("personalDataConsent", v ? true : (undefined as never), {
              shouldValidate: true,
            })
          }
          error={form.formState.errors.personalDataConsent?.message}
        />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Отправить заявку на размещение
      </Button>
    </form>
  );
}

function ConsentRow({
  id,
  label,
  checked,
  onChange,
  error,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
        <Label htmlFor={id} className="text-xs leading-relaxed font-normal">
          {label}
        </Label>
      </div>
      {error && <p className="text-xs text-destructive mt-1 ml-7">{error}</p>}
    </div>
  );
}
