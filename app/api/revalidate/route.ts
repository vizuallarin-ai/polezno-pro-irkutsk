import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  pathsForRevalidate,
  tagsForRevalidate,
} from "@/lib/revalidate-paths";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = (await request.json()) as {
      collection?: string;
      slug?: string;
    };

    if (body.collection != null && typeof body.collection !== "string") {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
    }
    if (body.slug != null && typeof body.slug !== "string") {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    if (typeof body.slug === "string" && body.slug.length > 200) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const paths = pathsForRevalidate(body);
    const tags = tagsForRevalidate(body);

    for (const path of paths) {
      revalidatePath(path);
    }
    for (const tag of tags) {
      // Next.js 16: second arg is cacheLife profile
      revalidateTag(tag, "max");
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      tags,
    });
  } catch {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
