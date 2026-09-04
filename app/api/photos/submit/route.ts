import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  PHOTO_CONSENT_VERSION,
  PHOTO_MODERATION_CONSENT_TEXT,
  PHOTO_RIGHTS_CONSENT_TEXT,
} from "@/lib/photo-constants";
import {
  checkRateLimit,
  getClientIp,
  sanitizeLeadText,
} from "@/lib/lead-spam";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIME_MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

const submitMetaSchema = z.object({
  name: z.string().trim().min(2).max(200),
  contact: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(2000),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  comment: z.string().trim().max(2000).optional(),
  year: z.string().trim().max(10).optional(),
  period: z.string().trim().max(100).optional(),
  street: z.string().trim().max(200).optional(),
  place: z.string().trim().max(200).optional(),
  authorName: z.string().trim().max(200).optional(),
  sourceName: z.string().trim().max(200).optional(),
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function detectMime(buffer: Buffer): string | null {
  for (const { mime, bytes } of MIME_MAGIC) {
    if (bytes.every((b, i) => buffer[i] === b)) {
      if (mime === "image/webp") {
        // RIFF....WEBP
        if (buffer.length >= 12 && buffer.toString("ascii", 8, 12) === "WEBP") {
          return mime;
        }
        continue;
      }
      return mime;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "Сервис временно недоступен." },
      { status: 503 }
    );
  }

  const ip = getClientIp(request.headers);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Прикрепите фото." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Разрешены только JPG, PNG и WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Файл слишком большой (максимум 10 МБ)." },
        { status: 400 }
      );
    }

    const rightsConsent = form.get("rightsConsent") === "true";
    const moderationConsent = form.get("moderationConsent") === "true";
    const personalDataConsent = form.get("personalDataConsent") === "true";

    if (!rightsConsent || !moderationConsent || !personalDataConsent) {
      return NextResponse.json(
        { ok: false, error: "Нужно подтвердить все согласия." },
        { status: 400 }
      );
    }

    const metaParsed = submitMetaSchema.safeParse({
      name: String(form.get("name") ?? ""),
      contact: String(form.get("contact") ?? ""),
      description: String(form.get("description") ?? ""),
      email: String(form.get("email") ?? ""),
      comment: String(form.get("comment") ?? ""),
      year: String(form.get("year") ?? ""),
      period: String(form.get("period") ?? ""),
      street: String(form.get("street") ?? ""),
      place: String(form.get("place") ?? ""),
      authorName: String(form.get("authorName") ?? ""),
      sourceName: String(form.get("sourceName") ?? ""),
    });

    if (!metaParsed.success) {
      return NextResponse.json(
        { ok: false, error: "Заполните обязательные поля." },
        { status: 400 }
      );
    }

    const meta = metaParsed.data;
    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectMime(buffer);
    if (!detected || detected !== file.type) {
      return NextResponse.json(
        { ok: false, error: "Файл не является допустимым изображением." },
        { status: 400 }
      );
    }

    const ext =
      detected === "image/png" ? "png" : detected === "image/webp" ? "webp" : "jpg";
    const safeName = `pending-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const titleBase =
      sanitizeLeadText(meta.description, 80) || "Фото от жителя";
    const slug = `${slugify(titleBase) || "photo"}-${Date.now().toString(36)}`;

    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const media = await payload.create({
      collection: "media",
      data: {
        alt: titleBase,
        visibility: "private",
      },
      file: {
        data: buffer,
        mimetype: detected,
        name: safeName,
        size: buffer.length,
      },
      overrideAccess: true,
    });

    const yearRaw = meta.year?.trim() ?? "";
    const year = yearRaw ? Number(yearRaw) : undefined;
    const name = sanitizeLeadText(meta.name, 200) || "Гость";
    const contact = sanitizeLeadText(meta.contact, 200) || "";

    await payload.create({
      collection: "photos",
      data: {
        title: titleBase,
        slug,
        description: [
          sanitizeLeadText(meta.description, 2000),
          sanitizeLeadText(meta.comment, 2000),
        ]
          .filter(Boolean)
          .join("\n\n"),
        category: "other",
        photoType: "user_submitted",
        image: media.id,
        year: Number.isFinite(year) ? year : undefined,
        period: sanitizeLeadText(meta.period, 100) || undefined,
        street: sanitizeLeadText(meta.street, 200) || undefined,
        place: sanitizeLeadText(meta.place, 200) || undefined,
        authorName:
          sanitizeLeadText(meta.authorName, 200) || name,
        sourceName: sanitizeLeadText(meta.sourceName, 200) || undefined,
        rightsType: "user_permission",
        permissionConfirmed: true,
        moderationStatus: "pending",
        status: "draft",
        submittedByName: name,
        submittedByContact: contact,
        submittedByEmail: sanitizeLeadText(meta.email, 200) || undefined,
        submittedAt: new Date().toISOString(),
        consentText: `${PHOTO_RIGHTS_CONSENT_TEXT}\n\n${PHOTO_MODERATION_CONSENT_TEXT}`,
        consentVersion: PHOTO_CONSENT_VERSION,
      },
      overrideAccess: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[photos/submit]", error);
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить фото. Попробуйте позже." },
      { status: 500 }
    );
  }
}
