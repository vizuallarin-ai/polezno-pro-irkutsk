"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const schema = z.object({
  dates: z.string().min(1, "Укажите планируемые даты"),
  groupSize: z.coerce.number().min(1, "Минимум 1 человек").max(500, "Максимум 500"),
  interests: z.array(z.string()).min(1, "Выберите хотя бы один интерес"),
  serviceType: z.string().min(1, "Выберите тип программы"),
  budget: z.string().min(1, "Выберите бюджет"),
  name: z.string().min(2, "Введите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const interests = [
  "Архитектура",
  "История",
  "Гастрономия",
  "Природа и Байкал",
  "Декабристы",
  "Деревянное зодчество",
  "Современная культура",
  "Ночной город",
  "Корпоративные активности",
];

const serviceTypes = [
  { value: "individual_tour", label: "Индивидуальный тур" },
  { value: "corporate", label: "Корпоративная программа" },
  { value: "excursion", label: "Экскурсия" },
  { value: "consulting", label: "Консалтинг" },
];

const budgets = [
  { value: "budget_10k", label: "До 10 000 ₽" },
  { value: "budget_30k", label: "10 000 — 30 000 ₽" },
  { value: "budget_100k", label: "30 000 — 100 000 ₽" },
  { value: "budget_100k_plus", label: "От 100 000 ₽" },
];

const STEPS = [
  { label: "Даты и группа", id: "dates" },
  { label: "Интересы", id: "interests" },
  { label: "Программа", id: "program" },
  { label: "Контакты", id: "contacts" },
];

export function ProgramForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      dates: "",
      groupSize: 1,
      interests: [] as string[],
      serviceType: "",
      budget: "",
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest];
    setSelectedInterests(updated);
    setValue("interests", updated, { shouldValidate: true });
  };

  const canProceed = async () => {
    if (step === 0) return trigger(["dates", "groupSize"]);
    if (step === 1) return trigger(["interests"]);
    if (step === 2) return trigger(["serviceType", "budget"]);
    return true;
  };

  const nextStep = async () => {
    const valid = await canProceed();
    if (valid && step < STEPS.length - 1) setStep(step + 1);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      alert("Ошибка отправки. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-baikal/10 flex items-center justify-center">
          <Check size={24} className="text-baikal" />
        </div>
        <div>
          <h2 className="text-2xl font-light mb-2">Заявка отправлена</h2>
          <p className="text-muted-foreground">
            Мы ответим в течение 24 часов на указанный email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-12">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs transition-colors duration-200",
                i === step
                  ? "bg-foreground text-primary-foreground"
                  : i < step
                  ? "bg-baikal text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px w-8 transition-colors duration-300",
                  i < step ? "bg-baikal" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-light mb-1">Даты и группа</h2>
              <p className="text-sm text-muted-foreground">
                Когда планируете приехать?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dates">Планируемые даты</Label>
              <Input
                id="dates"
                placeholder="например, 10–15 августа 2026"
                {...register("dates")}
              />
              {errors.dates && (
                <p className="text-xs text-destructive">{errors.dates.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="groupSize">Количество человек</Label>
              <Input
                id="groupSize"
                type="number"
                min={1}
                placeholder="1"
                {...register("groupSize")}
              />
              {errors.groupSize && (
                <p className="text-xs text-destructive">
                  {errors.groupSize.message}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-light mb-1">Интересы</h2>
              <p className="text-sm text-muted-foreground">
                Что хотите увидеть и узнать?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "text-sm px-4 py-2 border transition-colors duration-150",
                    selectedInterests.includes(interest)
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && (
              <p className="text-xs text-destructive">
                {errors.interests.message}
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-light mb-1">Программа</h2>
              <p className="text-sm text-muted-foreground">
                Какой тип программы вас интересует?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Тип программы</Label>
              <div className="flex flex-col gap-2 mt-1">
                {serviceTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      value={type.value}
                      {...register("serviceType")}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "w-4 h-4 border-2 rounded-full transition-colors duration-150",
                        watch("serviceType") === type.value
                          ? "border-foreground bg-foreground"
                          : "border-border group-hover:border-foreground"
                      )}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.serviceType && (
                <p className="text-xs text-destructive">
                  {errors.serviceType.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Бюджет</Label>
              <div className="flex flex-col gap-2 mt-1">
                {budgets.map((b) => (
                  <label
                    key={b.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      value={b.value}
                      {...register("budget")}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "w-4 h-4 border-2 rounded-full transition-colors duration-150",
                        watch("budget") === b.value
                          ? "border-foreground bg-foreground"
                          : "border-border group-hover:border-foreground"
                      )}
                    />
                    <span className="text-sm">{b.label}</span>
                  </label>
                ))}
              </div>
              {errors.budget && (
                <p className="text-xs text-destructive">
                  {errors.budget.message}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-light mb-1">Контактные данные</h2>
              <p className="text-sm text-muted-foreground">
                Как с вами связаться?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Имя *</Label>
              <Input id="name" placeholder="Ваше имя" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                {...register("phone")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Пожелания (необязательно)</Label>
              <Textarea
                id="message"
                placeholder="Расскажите подробнее о вашем запросе…"
                {...register("message")}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            className={cn(
              "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200",
              step === 0 && "invisible"
            )}
          >
            <ArrowLeft size={14} />
            Назад
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex h-10 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 active:scale-[0.98]"
            >
              Далее
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center gap-2 bg-baikal text-white px-6 text-sm font-medium hover:bg-baikal-light transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {isSubmitting ? "Отправляем…" : "Отправить заявку"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
