import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from "payload";

async function triggerRevalidate(collection: string, slug?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!baseUrl || !secret) return;

  try {
    await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ collection, slug }),
    });
  } catch (err) {
    console.error("[revalidate]", collection, slug, err);
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({
  doc,
  collection,
}) => {
  void triggerRevalidate(collection.slug, doc.slug as string | undefined);
};

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = ({
  doc,
  global,
}) => {
  void triggerRevalidate(global.slug);
};
