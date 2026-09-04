import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkHoneypot,
  checkRateLimit,
  getClientIp,
  sanitizeLeadText,
} from "@/lib/lead-spam";

const newsletterSchema = z.object({
  email: z.string().email().max(200),
  _hp: z.string().optional(),
  _formStartedAt: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (checkHoneypot(body)) {
      return NextResponse.json({ ok: true });
    }

    const ip = getClientIp(request.headers);
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
    }

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
    }

    const email = sanitizeLeadText(parsed.data.email, 200);
    if (!email) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    await payload.create({
      collection: "leads",
      data: {
        name: "Newsletter",
        email,
        serviceType: "general",
        source: "newsletter",
        status: "new",
        message: "Подписка на рассылку",
      },
      overrideAccess: true,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
