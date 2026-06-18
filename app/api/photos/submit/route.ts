import { NextRequest, NextResponse } from "next/server";
import {
  PHOTO_CONSENT_VERSION,
  PHOTO_MODERATION_CONSENT_TEXT,
  PHOTO_RIGHTS_CONSENT_TEXT,
} from "@/lib/photo-constants";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "Сервис временно недоступен." },
      { status: 503 }
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

    const name = String(form.get("name") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    if (name.length < 2 || contact.length < 3 || description.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Заполните обязательные поля." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const safeName = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const titleBase = description.slice(0, 80) || "Фото от жителя";
    const slug = `${slugify(titleBase) || "photo"}-${Date.now().toString(36)}`;

    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const media = await payload.create({
      collection: "media",
      data: {
        alt: titleBase,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: safeName,
        size: buffer.length,
      },
      overrideAccess: true,
    });

    const yearRaw = String(form.get("year") ?? "").trim();
    const year = yearRaw ? Number(yearRaw) : undefined;

    await payload.create({
      collection: "photos",
      data: {
        title: titleBase,
        slug,
        description: [
          description,
          String(form.get("comment") ?? "").trim(),
        ]
          .filter(Boolean)
          .join("\n\n"),
        category: "other",
        photoType: "user_submitted",
        image: media.id,
        year: Number.isFinite(year) ? year : undefined,
        period: String(form.get("period") ?? "").trim() || undefined,
        street: String(form.get("street") ?? "").trim() || undefined,
        place: String(form.get("place") ?? "").trim() || undefined,
        authorName:
          String(form.get("authorName") ?? "").trim() || name,
        sourceName: String(form.get("sourceName") ?? "").trim() || undefined,
        rightsType: "user_permission",
        permissionConfirmed: true,
        moderationStatus: "pending",
        status: "draft",
        submittedByName: name,
        submittedByContact: contact,
        submittedByEmail: String(form.get("email") ?? "").trim() || undefined,
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
