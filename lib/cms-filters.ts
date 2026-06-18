import type { Where } from "payload";

export const PUBLISHED_STATUS_WHERE: Where = {
  status: { equals: "published" },
};

export const ARTICLE_PUBLISHED_WHERE: Where = {
  and: [
    { _status: { equals: "published" } },
    { status: { equals: "published" } },
  ],
};

export function upcomingEventsWhere(): Where {
  return {
    and: [
      PUBLISHED_STATUS_WHERE,
      { isPast: { equals: false } },
    ],
  };
}

export function pastEventsWhere(): Where {
  return {
    and: [
      PUBLISHED_STATUS_WHERE,
      { isPast: { equals: true } },
    ],
  };
}

export function catalogProductsWhere(): Where {
  return {
    and: [
      PUBLISHED_STATUS_WHERE,
      {
        stockStatus: {
          not_equals: "out_of_stock",
        },
      },
    ],
  };
}

export function newLeadsWhere(): Where {
  return { status: { equals: "new" } };
}

export const PHOTO_PUBLISHED_WHERE: Where = {
  and: [
    { status: { equals: "published" } },
    { moderationStatus: { equals: "approved" } },
  ],
};

export function pendingPhotosWhere(): Where {
  return { moderationStatus: { equals: "pending" } };
}

export const MAKER_PUBLISHED_WHERE: Where = {
  and: [
    PUBLISHED_STATUS_WHERE,
    { placementStatus: { equals: "active" } },
  ],
};
