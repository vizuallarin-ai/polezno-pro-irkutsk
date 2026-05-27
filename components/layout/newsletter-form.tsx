"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
});
type FormValues = z.infer<typeof schema>;

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      // fail silently — newsletter is non-critical
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
        <Check size={14} className="text-ice shrink-0" />
        Вы подписаны на рассылку
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-primary-foreground/40 mb-1">
        Рассылка
      </p>
      <p className="text-sm text-primary-foreground/60 mb-3">
        Новые маршруты, события и материалы
      </p>
      <div className="flex gap-0">
        <input
          type="email"
          placeholder="ваш@email.ru"
          {...register("email")}
          className={cn(
            "flex-1 h-10 px-4 text-sm bg-transparent border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-primary-foreground/50 transition-colors duration-200",
            errors.email && "border-red-400/50"
          )}
          aria-label="Email для подписки"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Подписаться"
          className="flex items-center justify-center w-10 h-10 border border-l-0 border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/50 transition-colors duration-200 shrink-0 disabled:opacity-40"
        >
          <ArrowRight size={14} />
        </button>
      </div>
      {errors.email && (
        <p className="text-xs text-red-400/80">{errors.email.message}</p>
      )}
    </form>
  );
}
