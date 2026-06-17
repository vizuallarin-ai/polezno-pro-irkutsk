/**
 * Seed Phase 7 explore materials (8 published articles).
 * Run after DB is up: node scripts/seed-explore-materials.mjs
 */
import { getPayload } from "payload";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { default: config } = await import("../payload.config.js");
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

/** Load section text from bundled JSON (generated from TS data). */
const sectionsPath = join(__dirname, "explore-materials-sections.json");
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
  const res = await payload.find({
    collection: "routes",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return res.docs[0]?.id ?? null;
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

  if (existing.docs.length === 0) {
    await payload.create({ collection: "articles", data: payloadData });
    console.log(`✓ [articles] ${item.title}`);
  } else {
    await payload.update({
      collection: "articles",
      id: existing.docs[0].id,
      data: payloadData,
    });
    console.log(`↻ обновлён: ${item.slug}`);
  }
}

console.log("\n✅ Explore materials seed завершён.");
process.exit(0);
