import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Контакты — Полезно про Иркутск",
  description: "Свяжитесь с нами по вопросам туров, экскурсий и сотрудничества.",
};

export default function ContactPage() {
  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Связаться
            </p>
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
              Напишите
              <br />
              <span className="font-serif italic">нам</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-xs">
              По вопросам туров, экскурсий, консалтинга и сотрудничества.
            </p>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:info@polezno.irkutsk.ru"
                className="inline-flex items-center gap-3 text-sm group"
              >
                <Mail
                  size={16}
                  className="text-muted-foreground group-hover:text-baikal transition-colors"
                />
                <span className="group-hover:text-baikal transition-colors">
                  info@polezno.irkutsk.ru
                </span>
              </a>
              <a
                href="https://t.me/polezno_irkutsk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm group"
              >
                <MessageCircle
                  size={16}
                  className="text-muted-foreground group-hover:text-baikal transition-colors"
                />
                <span className="group-hover:text-baikal transition-colors">
                  Telegram
                </span>
              </a>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
