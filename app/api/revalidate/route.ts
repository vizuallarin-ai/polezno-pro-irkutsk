import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      collection?: string;
      slug?: string;
    };

    const { collection, slug } = body;

    if (collection === "articles" && slug) {
      revalidatePath(`/explore/${slug}`);
      revalidatePath("/explore");
    } else if (collection === "events" && slug) {
      revalidatePath(`/events/${slug}`);
      revalidatePath("/events");
    } else if (collection === "products" && slug) {
      revalidatePath(`/shop/${slug}`);
      revalidatePath("/shop");
    } else if (collection === "routes") {
      revalidatePath("/map");
      if (slug) revalidatePath(`/map/${slug}`);
    } else if (collection === "excursions") {
      revalidatePath("/program");
    } else if (collection === "photos" && slug) {
      revalidatePath(`/explore/photos/${slug}`);
      revalidatePath("/explore/photos");
    } else if (collection === "photos") {
      revalidatePath("/explore/photos");
    } else if (collection === "site-settings") {
      revalidatePath("/");
      revalidatePath("/about");
    } else {
      revalidatePath("/");
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
