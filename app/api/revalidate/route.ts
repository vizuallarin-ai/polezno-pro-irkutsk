import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  pathsForRevalidate,
  tagsForRevalidate,
} from "@/lib/revalidate-paths";

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
