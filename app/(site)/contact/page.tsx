import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "@/components/forms/contact-form";
import { MessengerLinks } from "@/components/contact/messenger-links";
import { CTA } from "@/lib/cta-constants";

export const metadata: Metadata = {
  title: "Контакты — подобрать прогулку",
  description:
    "Напишите Алёне Ямщиковой: подберём самостоятельный маршрут или формат с гидом. Для корпоративных программ — отдельный раздел «Для бизнеса».",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const settings = await getSiteSettings();
  const sp = await searchParams;
  const intent = first(sp.intent);
  const productType = first(sp.productType);
  const slug = first(sp.slug);
  const articleSlug = first(sp.article);
  const sourceBlock = first(sp.sourceBlock) ?? "contact-page";

  const defaultRequestType =
    productType === "excursion" || intent === "excursion"
      ? "guided_route"
      : productType === "route" || intent === "route" || intent === "walk"
        ? "route_request"
        : "general_contact";

  const contextBits = [
    slug ? `Тема: ${productType ?? intent ?? "запрос"} / ${slug}` : null,
    articleSlug ? `Статья: ${articleSlug}` : null,
  ].filter(Boolean);

  const defaultMessage = contextBits.length
    ? `${contextBits.join(". ")}.\n\n`
    : "";

  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start flex flex-col gap-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Подобрать прогулку
              </p>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
                Напишите
                <br />
                <span className="font-serif italic">Алёне</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4 max-w-sm">
                Оставьте контакты — подберём самостоятельный маршрут или формат с
                гидом под ваш день. После отправки заявка сохранится, и с вами
                свяжутся по указанному способу связи.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
                Срок ответа зависит от загрузки. Для программ компаний и
                делегаций используйте раздел{" "}
                <Link
                  href={CTA.b2bNav.href}
                  className="text-baikal hover:underline"
                >
                  {CTA.b2bNav.label}
                </Link>
                .
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
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>Самостоятельная прогулка по городу</li>
                <li>Экскурсия или персональный подбор с гидом</li>
                <li>Вопросы по материалам и фотоархиву</li>
                <li>
                  Корпоративные программы — через{" "}
                  <Link href={CTA.b2bNav.href} className="text-baikal hover:underline">
                    {CTA.b2bNav.label}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div id="lead-form">
            <ContactForm
              consentText={settings.leadSettings.consentText}
              consentVersion={settings.leadSettings.consentVersion}
              privacyPolicyUrl={settings.leadSettings.privacyPolicyUrl}
              sourceSlug={slug}
              sourceTitle={
                slug
                  ? `${productType ?? intent ?? "request"}:${slug}`
                  : articleSlug
                    ? `article:${articleSlug}`
                    : undefined
              }
              sourceBlock={sourceBlock}
              defaultRequestType={defaultRequestType}
              defaultMessage={defaultMessage}
              materialContext={
                articleSlug
                  ? { slug: articleSlug, title: articleSlug }
                  : undefined
              }
              routeContext={
                productType === "route" && slug
                  ? { slug, title: slug }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
