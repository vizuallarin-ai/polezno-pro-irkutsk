/**
 * Seed Phase 7 explore materials (8 published articles).
 * Run after DB is up: npm run seed:explore
 */
import fs from "node:fs";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { buildConfig, getPayload } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

nextEnv.loadEnvConfig(root);

function loadEnvFile(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");
loadEnvFile(".env.production");

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}
if (!process.env.PAYLOAD_SECRET?.trim()) {
  console.error("PAYLOAD_SECRET is missing");
  process.exit(1);
}

const { Users } = await import("../payload/collections/Users.ts");
const { Media } = await import("../payload/collections/Media.ts");
const { Routes } = await import("../payload/collections/Routes.ts");
const { Places } = await import("../payload/collections/Places.ts");
const { Articles } = await import("../payload/collections/Articles.ts");
const { Events } = await import("../payload/collections/Events.ts");
const { Products } = await import("../payload/collections/Products.ts");
const { Excursions } = await import("../payload/collections/Excursions.ts");
const { Reviews } = await import("../payload/collections/Reviews.ts");
const { Partners } = await import("../payload/collections/Partners.ts");
const { Leads } = await import("../payload/collections/Leads.ts");
const { Guides } = await import("../payload/collections/Guides.ts");
const { SiteSettings } = await import("../payload/globals/SiteSettings.ts");
const { Navigation } = await import("../payload/globals/Navigation.ts");

const config = buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  collections: [
    Users,
    Routes,
    Leads,
    Media,
    Places,
    Excursions,
    Articles,
    Events,
    Products,
    Guides,
    Reviews,
    Partners,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    push: false,
  }),
});

const payload = await getPayload({ config });

function textNode(text) {
  return {
    type: "text",
    text,
    format: 0,
    detail: 0,
    mode: "normal",
    style: "",
    version: 1,
  };
}

function paragraph(text) {
  return {
    type: "paragraph",
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

function heading(text) {
  return {
    type: "heading",
    tag: "h2",
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  };
}

function lexicalFromSections(sections) {
  const children = sections.flatMap((section) => {
    const nodes = [];
    if (section.heading) nodes.push(heading(section.heading));
    for (const p of section.paragraphs) nodes.push(paragraph(p));
    return nodes;
  });
  return {
    root: {
      type: "root",
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

const sectionsPath = path.join(__dirname, "explore-materials-sections.json");
const SECTIONS_BY_SLUG = JSON.parse(readFileSync(sectionsPath, "utf8"));

const MATERIALS = [
  {
    slug: "irkutsk-history",
    title: "Иркутск: короткая история города",
    category: "history",
    materialType: "history",
    excerpt:
      "От казачьего острога до современного города у Ангары — десять опорных точек, которые помогают понять Иркутск до прогулки по центру.",
    coverUrl: "/images/explore-history.svg",
    readTime: 12,
    isFeatured: true,
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-01-15T10:00:00.000Z",
    seo: {
      title: "История Иркутска — короткий рассказ о городе у Ангары",
      description:
        "Короткая история Иркутска: острог, купечество, декабристы, Транссиб, деревянное зодчество и связь с Байкалом.",
    },
  },
  {
    slug: "irkutsk-not-only-baikal",
    title: "Иркутск — это не только Байкал",
    category: "what-to-see",
    materialType: "article",
    excerpt:
      "Почему стоит оставить в поездке хотя бы день на город: архитектура, дворы, рынки и жизнь у Ангары.",
    coverUrl: "/images/explore-sights.svg",
    readTime: 7,
    isFeatured: true,
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-02-01T10:00:00.000Z",
  },
  {
    slug: "wooden-irkutsk-details",
    title: "Деревянный Иркутск: на что смотреть в деталях",
    category: "architecture",
    materialType: "guide",
    excerpt:
      "Наличники, мезонины, ставни и дворы — как читать деревянный город не спеша.",
    coverUrl: "/images/article-wooden.svg",
    readTime: 8,
    isFeatured: true,
    relatedRouteSlug: "wooden-irkutsk",
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-02-10T10:00:00.000Z",
  },
  {
    slug: "irkutsk-center-two-hours",
    title: "Центр Иркутска за два часа",
    category: "where-to-walk",
    materialType: "guide",
    excerpt:
      "Короткая прогулка для первого знакомства: площадь, Ангара, деревянные улицы и кофе по пути.",
    coverUrl: "/images/explore-walks.svg",
    readTime: 5,
    isFeatured: true,
    relatedRouteSlug: "irkutsk-first-morning",
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-02-15T10:00:00.000Z",
  },
  {
    slug: "old-irkutsk-places",
    title: "Старый Иркутск: места вне открыток",
    category: "hidden",
    materialType: "place",
    excerpt:
      "Дворы, переулки и виды, которые редко попадают в путеводители, но хорошо знакомы местным.",
    coverUrl: "/images/explore-hidden.svg",
    readTime: 6,
    isFeatured: true,
    isHiddenGem: true,
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-03-01T10:00:00.000Z",
  },
  {
    slug: "irkutsk-and-baikal",
    title: "Иркутск и Байкал: как связать в одну поездку",
    category: "baikal",
    materialType: "guide",
    excerpt:
      "Логистика, сезон и баланс: сколько времени оставить городу и сколько — озеру.",
    coverUrl: "/images/article-baikal.svg",
    readTime: 9,
    isFeatured: true,
    relatedRouteSlug: "irkutsk-to-baikal",
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-03-10T10:00:00.000Z",
  },
  {
    slug: "irkutsk-winter",
    title: "Иркутск зимой: город, который не засыпает",
    category: "winter",
    materialType: "article",
    excerpt:
      "Мороз, свет, набережная и выезды к Байкалу — как планировать зимний визит без лишней суеты.",
    coverUrl: "/images/explore-baikal.svg",
    readTime: 8,
    isFeatured: true,
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-11-01T10:00:00.000Z",
  },
  {
    slug: "irkutsk-without-postcards",
    title: "Иркутск без открыток",
    category: "locals",
    materialType: "article",
    excerpt:
      "Город для тех, кто устал от «топ-10» и хочет увидеть настоящие дворы, привычные маршруты и локальную повседневность.",
    coverUrl: "/images/article-hidden.svg",
    readTime: 7,
    isFeatured: true,
    isHiddenGem: true,
    relatedRouteSlug: "not-for-postcards",
    authorName: "Алёна Ямщикова",
    publishedAt: "2025-03-20T10:00:00.000Z",
  },
];

async function routeIdBySlug(slug) {
  try {
    const res = await payload.find({
      collection: "routes",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    return res.docs[0]?.id ?? null;
  } catch {
    console.warn(`⚠ Не удалось найти маршрут ${slug} — связь пропущена`);
    return null;
  }
}

console.log("🌱 Seed explore materials (Phase 7)...\n");

for (const item of MATERIALS) {
  const sections = SECTIONS_BY_SLUG[item.slug];
  if (!sections) {
    console.warn(`⚠ Нет секций для ${item.slug}`);
    continue;
  }

  const { relatedRouteSlug, seo, ...data } = item;
  let relatedRoute;
  if (relatedRouteSlug) {
    relatedRoute = await routeIdBySlug(relatedRouteSlug);
  }

  const existing = await payload.find({
    collection: "articles",
    where: { slug: { equals: item.slug } },
    limit: 1,
  });

  const payloadData = {
    ...data,
    content: lexicalFromSections(sections),
    status: "published",
    _status: "published",
    ...(seo ? { seo } : {}),
    ...(relatedRoute ? { relatedRoute } : {}),
  };

  const createOptions = { collection: "articles", data: payloadData, draft: false };

  if (existing.docs.length === 0) {
    await payload.create(createOptions);
    console.log(`✓ [articles] ${item.title}`);
  } else {
    await payload.update({
      collection: "articles",
      id: existing.docs[0].id,
      data: payloadData,
      draft: false,
    });
    console.log(`↻ обновлён: ${item.slug}`);
  }
}

console.log("\n✅ Explore materials seed завершён.");
process.exit(0);
