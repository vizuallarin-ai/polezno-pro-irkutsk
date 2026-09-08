import type { Metadata } from "next";

/** Indexable when the surface has real published content; otherwise crawlable but noindex. */
export function robotsForContentPresence(hasIndexableContent: boolean): Metadata["robots"] {
  if (hasIndexableContent) {
    return { index: true, follow: true };
  }
  return { index: false, follow: true };
}

export const ROBOTS_NOINDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
};

export const ROBOTS_NOINDEX_NOFOLLOW: Metadata["robots"] = {
  index: false,
  follow: false,
};
