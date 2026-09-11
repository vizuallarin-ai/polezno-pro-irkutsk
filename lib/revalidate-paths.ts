/**
 * Collection → public path / tag matrix for on-demand revalidation (ADMIN.B).
 * Keep in sync with frontend consumers.
 */

export type RevalidateRequest = {
  collection?: string;
  slug?: string;
};

export function pathsForRevalidate(input: RevalidateRequest): string[] {
  const { collection, slug } = input;
  const paths = new Set<string>();

  switch (collection) {
    case "articles":
      paths.add("/explore");
      paths.add("/");
      if (slug) paths.add(`/explore/${slug}`);
      break;

    case "events":
      paths.add("/events");
      if (slug) paths.add(`/events/${slug}`);
      break;

    case "products":
      paths.add("/souvenirs");
      if (slug) paths.add(`/souvenirs/${slug}`);
      break;

    case "makers":
      paths.add("/souvenirs");
      paths.add("/souvenirs/makers");
      if (slug) paths.add(`/souvenirs/makers/${slug}`);
      break;

    case "routes":
      paths.add("/map");
      paths.add("/");
      if (slug) paths.add(`/map/${slug}`);
      break;

    case "excursions":
      paths.add("/map");
      paths.add("/business");
      paths.add("/");
      if (slug) paths.add(`/excursions/${slug}`);
      break;

    case "photos":
      paths.add("/explore/photos");
      paths.add("/explore");
      if (slug) paths.add(`/explore/photos/${slug}`);
      break;

    case "ar-postcards":
      paths.add("/ar-postcards");
      if (slug) paths.add(`/ar-postcards/${slug}`);
      break;

    case "reviews":
      paths.add("/");
      break;

    case "guides":
      paths.add("/about/guides");
      paths.add("/about");
      break;

    case "site-settings":
      paths.add("/");
      paths.add("/about");
      paths.add("/contact");
      break;

    case "navigation":
      paths.add("/");
      break;

    default:
      paths.add("/");
      break;
  }

  return [...paths];
}

/** Cache tags used alongside path revalidation when tagged fetches exist. */
export function tagsForRevalidate(input: RevalidateRequest): string[] {
  const { collection, slug } = input;
  if (!collection) return [];

  const tags = new Set<string>([`cms:${collection}`]);
  if (slug) tags.add(`cms:${collection}:${slug}`);
  return [...tags];
}
