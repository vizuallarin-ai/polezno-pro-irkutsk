import type { Where } from "payload";

export const PUBLISHED_STATUS_WHERE: Where = {
  status: { equals: "published" },
};

export const ARTICLE_PUBLISHED_WHERE: Where = {
  _status: { equals: "published" },
};

export function upcomingEventsWhere(): Where {
  return {
    and: [
      PUBLISHED_STATUS_WHERE,
      { startDate: { greater_than_equal: new Date().toISOString() } },
    ],
  };
}

export function newLeadsWhere(): Where {
  return { status: { equals: "new" } };
}
