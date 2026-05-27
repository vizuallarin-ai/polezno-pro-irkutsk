import { NextRequest, NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const source = request.headers.get("referer") || "direct";

    const lead = await payload.create({
      collection: "leads",
      data: {
        name: String(body.name || ""),
        email: String(body.email || ""),
        phone: body.phone ? String(body.phone) : undefined,
        serviceType: body.serviceType ? String(body.serviceType) : "general",
        dates: body.dates ? String(body.dates) : undefined,
        groupSize: body.groupSize ? Number(body.groupSize) : undefined,
        interests: Array.isArray(body.interests)
          ? body.interests.map((i: unknown) => ({ interest: String(i) }))
          : [],
        budget: body.budget ? String(body.budget) : undefined,
        message: body.message ? String(body.message) : undefined,
        status: "new",
        source,
      },
    });

    // Notify admin about new lead (non-blocking)
    sendLeadNotification({
      name: String(body.name || ""),
      email: String(body.email || ""),
      serviceType: body.serviceType ? String(body.serviceType) : undefined,
      message: body.message ? String(body.message) : undefined,
    }).catch((err) => console.error("Lead notification error:", err));

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
