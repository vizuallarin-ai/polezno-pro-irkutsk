import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "@/components/forms/contact-form";
import { MessengerLinks } from "@/components/contact/messenger-links";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с Алёной Ямщиковой по вопросам маршрутов, экскурсий, сувениров и сотрудничества.",
};

const TOPICS = [
  { label: "Подобрать маршрут", href: "/map" },
  { label: "Пройти с Алёной", href: "/business?taskType=route_program" },
  { label: "Программа для компании", href: "/business" },
  { label: "Уточнить сувенир", href: "/souvenirs" },
  { label: "Предложить фото", href: "/explore/photos/submit" },
  { label: "Обсудить проект", href: "/about" },
  { label: "Задать вопрос", href: "/explore" },
];

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start flex flex-col gap-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Связаться
              </p>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
                Напишите
                <br />
                <span className="font-serif italic">нам</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
                По вопросам маршрутов, экскурсий, сувениров, фотоархива и
                сотрудничества. Ответим в течение рабочего дня.
              </p>
              <MessengerLinks
                contact={settings.contact}
                sourceType="contact"
                sourceBlock="contact-page"
                layout="column"
              />
            </div>

            <div>
              <h2 className="text-sm font-medium mb-4">С чем можно обратиться</h2>
              <ul className="flex flex-col gap-2">
                {TOPICS.map((topic) => (
                  <li key={topic.label}>
                    <Link
                      href={topic.href}
                      className="text-sm text-muted-foreground hover:text-baikal transition-colors"
                    >
                      {topic.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div id="lead-form">
            <ContactForm
              consentText={settings.leadSettings.consentText}
              consentVersion={settings.leadSettings.consentVersion}
              privacyPolicyUrl={settings.leadSettings.privacyPolicyUrl}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
