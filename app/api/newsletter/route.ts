import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email: string };
    if (!email) return NextResponse.json({ ok: false });

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
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
