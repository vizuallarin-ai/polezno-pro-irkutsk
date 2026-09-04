import fs from "fs/promises";
import path from "path";
import type { Payload } from "payload";

const MEDIA_DIR = path.resolve(process.cwd(), "public/media");

/**
 * Mark media public and rename pending-* files so middleware no longer blocks them.
 */
export async function promotePendingMedia(
  payload: Payload,
  mediaId: string | number
): Promise<void> {
  const id = String(mediaId);
  const doc = await payload.findByID({
    collection: "media",
    id,
    depth: 0,
    overrideAccess: true,
  });

  const filename = typeof doc.filename === "string" ? doc.filename : "";
  const nextVisibility =
    doc.visibility === "public" ? undefined : ({ visibility: "public" } as const);

  if (!filename.startsWith("pending-")) {
    if (nextVisibility) {
      await payload.update({
        collection: "media",
        id,
        data: nextVisibility,
        overrideAccess: true,
      });
    }
    return;
  }

  const publicName = filename.slice("pending-".length);
  const sizes = (doc.sizes ?? {}) as Record<
    string,
    { filename?: string | null } | null | undefined
  >;

  const renames: Array<{ from: string; to: string }> = [
    { from: filename, to: publicName },
  ];

  for (const size of Object.values(sizes)) {
    const sizeName = size?.filename;
    if (typeof sizeName === "string" && sizeName.startsWith("pending-")) {
      renames.push({ from: sizeName, to: sizeName.slice("pending-".length) });
    }
  }

  for (const { from, to } of renames) {
    const fromPath = path.join(MEDIA_DIR, from);
    const toPath = path.join(MEDIA_DIR, to);
    try {
      await fs.rename(fromPath, toPath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
    }
  }

  const nextSizes: Record<string, { filename?: string }> = {};
  for (const [key, size] of Object.entries(sizes)) {
    if (!size) continue;
    const sizeName = size.filename;
    nextSizes[key] = {
      ...size,
      filename:
        typeof sizeName === "string" && sizeName.startsWith("pending-")
          ? sizeName.slice("pending-".length)
          : sizeName ?? undefined,
    };
  }

  await payload.update({
    collection: "media",
    id,
    data: {
      visibility: "public",
      filename: publicName,
      url: `/media/${publicName}`,
      ...(Object.keys(nextSizes).length > 0 ? { sizes: nextSizes } : {}),
    },
    overrideAccess: true,
  });
}
