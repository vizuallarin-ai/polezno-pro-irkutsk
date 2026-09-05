import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "@/components/forms/contact-form";
import { MessengerLinks } from "@/components/contact/messenger-links";
import { CTA } from "@/lib/cta-constants";
import type { RequestType } from "@/lib/leads-constants";

export const metadata: Metadata = {
  title: "Контакты — подобрать прогулку",
  description:
    "Напишите Алёне Ямщиковой: подберём самостоятельный маршрут или формат с Алёной. Для корпоративных программ — отдельный раздел «Для бизнеса».",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function resolveContactChrome(input: {
  intent?: string;
  productType?: string;
  slug?: string;
  articleSlug?: string;
}): {
  eyebrow: string;
  title: string;
  description: string;
  requestType: RequestType;
  submitLabel: string;
  showDate: boolean;
  showPeople: boolean;
  showFormat: boolean;
} {
  const { intent, productType, slug, articleSlug } = input;

  if (productType === "excursion" || intent === "excursion") {
    return {
      eyebrow: CTA.guided.label,
      title: "Пройти с Алёной",
      description:
        "Оставьте имя и контакт — маршрут уже понятен из запроса. При желании уточните даты и компанию.",
      requestType: "guided_route",
      submitLabel: CTA.guided.label,
      showDate: true,
      showPeople: true,
      showFormat: false,
    };
  }

  if (productType === "route" || intent === "route") {
    return {
      eyebrow: CTA.guided.label,
      title: "Пройти этот маршрут с Алёной",
      description:
        "Контекст маршрута уже сохранён. Нужны только имя и способ связи — детали можно уточнить ниже.",
      requestType: "guided_route",
      submitLabel: CTA.guided.label,
      showDate: true,
      showPeople: true,
      showFormat: true,
    };
  }

  if (intent === "walk") {
    return {
      eyebrow: CTA.assist.label,
      title: "Подобрать прогулку",
      description:
        "Расскажите, как с вами связаться — подберём самостоятельный маршрут или формат с Алёной. Длинное сообщение не обязательно.",
      requestType: "route_request",
      submitLabel: CTA.assist.label,
      showDate: true,
      showPeople: true,
      showFormat: false,
    };
  }

  if (intent === "souvenir") {
    return {
      eyebrow: "Сувениры",
      title: "Узнать о коллекции",
      description:
        "Оставьте контакт — уточним наличие или сообщим о запуске. Название позиции передаётся автоматически, если вы пришли со страницы товара.",
      requestType: "souvenir_general",
      submitLabel: "Написать о коллекции",
      showDate: false,
      showPeople: false,
      showFormat: false,
    };
  }

  if (intent === "ar") {
    return {
      eyebrow: "AR-открытки",
      title: "Вопрос по открытке",
      description:
        "Контекст открытки сохраняется автоматически. Достаточно имени и контакта.",
      requestType: "ar_postcard_preorder",
      submitLabel: "Написать об открытке",
      showDate: false,
      showPeople: false,
      showFormat: false,
    };
  }

  if (intent === "photo") {
    return {
      eyebrow: "Фотоархив",
      title: "Вопрос по кадру",
      description:
        "Можно спросить о месте на фото или предложить свой снимок — сначала оставьте контакт.",
      requestType: "photo_submission_question",
      submitLabel: CTA.contactSecondary.label,
      showDate: false,
      showPeople: false,
      showFormat: false,
    };
  }

  if (intent === "explore" || articleSlug) {
    return {
      eyebrow: "Исследовать",
      title: "Вопрос о городе",
      description:
        "Если материал навёл на мысль о маршруте — напишите. Ссылку на статью сохраним в заявке.",
      requestType: "content_question",
      submitLabel: CTA.assist.label,
      showDate: false,
      showPeople: false,
      showFormat: false,
    };
  }

  return {
    eyebrow: CTA.assist.label,
    title: "Напишите Алёне",
    description:
      "Оставьте имя и контакт — подберём самостоятельный маршрут или формат с Алёной. Длинное сообщение не обязательно.",
    requestType: "general_contact",
    submitLabel: CTA.assist.label,
    showDate: false,
    showPeople: false,
    showFormat: false,
  };
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

  const chrome = resolveContactChrome({
    intent,
    productType,
    slug,
    articleSlug,
  });

  const isRouteLike =
    productType === "route" ||
    intent === "route" ||
    (intent === "walk" && Boolean(slug));

  const routeContext =
    isRouteLike && slug
      ? {
          slug,
          title: slug.replace(/-/g, " "),
        }
      : productType === "route" && slug
        ? { slug, title: slug.replace(/-/g, " ") }
        : undefined;

  const sourceTitle = routeContext?.title
    ? routeContext.title
    : articleSlug
      ? `Статья: ${articleSlug}`
      : slug
        ? `${productType ?? intent ?? "request"}:${slug}`
        : undefined;

  return (
    <main className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start flex flex-col gap-10">
            <div>
              <p className="type-eyebrow text-muted-foreground mb-4">
                {chrome.eyebrow}
              </p>
              <h1 className="type-page-title text-foreground mb-6 max-w-[14ch]">
                {chrome.title}
              </h1>
              <p className="type-lead text-muted-foreground mb-4 max-w-sm text-pretty">
                {chrome.description}
              </p>
              <p className="type-body-sm text-muted-foreground mb-8 max-w-sm text-pretty">
                Для программ компаний и делегаций — раздел{" "}
                <Link
                  href={CTA.b2bNav.href}
                  className="text-baikal hover:underline"
                >
                  {CTA.b2bNav.label}
                </Link>
                .
              </p>
              <div className="flex flex-col gap-3">
                <p className="type-caption uppercase tracking-widest text-muted-foreground">
                  Или напишите напрямую
                </p>
                <MessengerLinks
                  contact={settings.contact}
                  sourceType="contact"
                  sourceBlock="contact-page"
                  layout="column"
                />
              </div>
            </div>

            <div>
              <h2 className="type-ui-label mb-4">С чем можно обратиться</h2>
              <ul className="flex flex-col gap-2 type-body-sm text-muted-foreground">
                <li>Самостоятельная прогулка по городу</li>
                <li>Прогулка с Алёной</li>
                <li>Вопросы по материалам и фотоархиву</li>
                <li>
                  Корпоративные программы — через{" "}
                  <Link
                    href={CTA.b2bNav.href}
                    className="text-baikal hover:underline"
                  >
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
              sourceTitle={sourceTitle}
              sourceBlock={sourceBlock}
              defaultRequestType={chrome.requestType}
              showDate={chrome.showDate}
              showPeopleCount={chrome.showPeople}
              showFormat={chrome.showFormat}
              submitLabel={chrome.submitLabel}
              materialContext={
                articleSlug
                  ? { slug: articleSlug, title: articleSlug }
                  : undefined
              }
              routeContext={routeContext}
              fallbackTelegram={settings.contact.telegram}
              fallbackMax={settings.contact.max}
              fallbackEmail={settings.contact.email}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
