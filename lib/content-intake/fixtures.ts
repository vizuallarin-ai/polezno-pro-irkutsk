/**
 * Synthetic TEST_FIXTURE only — never ingest into CMS / production.
 */

import type { OwnerPack } from "./schemas";

export const TEST_FIXTURE_PACK: OwnerPack = {
  packVersion: "test-fixture-v0",
  receivedAt: "2026-01-01",
  source: "TEST_FIXTURE",
  ownerConfirmedAt: null,
  isTestFixture: true,
  status: "RECEIVED",
  excursions: [
    {
      ownerContentId: "excursion.test-fixture-01",
      title: "TEST FIXTURE Excursion — Do Not Publish",
      slug: "test-fixture-excursion",
      shortDescription:
        "Synthetic short description for schema unit tests only. Not a real product.",
      fullDescription: "Synthetic full description for unit tests. Not owner content.",
      format: "walking",
      price: {
        amount: 1000,
        currency: "RUB",
        pricingUnit: "per_group",
        displayText: "1000 RUB per group (TEST)",
        ownerConfirmationDate: "2026-01-01",
      },
      durationMinutes: 90,
      groupSize: "до 2 (TEST)",
      meetingPoint: "TEST meeting point — not real",
      bookingRules: "TEST booking rules",
      cancellationRules: "TEST cancel rules",
      included: ["TEST include"],
      notIncluded: ["TEST exclude"],
      heroImageOwnerContentId: "media.test-fixture-01",
      guideOwnerContentId: "guide.test-fixture-01",
      routeOwnerContentId: "route.test-fixture-01",
      publicationApproval: true,
      ownerConfirmed: true,
    },
  ],
  routes: [
    {
      ownerContentId: "route.test-fixture-01",
      title: "TEST FIXTURE Route",
      slug: "test-fixture-route",
      shortDescription: "Synthetic route for tests only.",
      category: "history",
      format: "walking",
      durationMinutes: 60,
      distanceKm: 1,
      points: [
        {
          title: "TEST point A",
          lat: 52.28,
          lng: 104.28,
          geocodeStatus: "COORDINATES_PROVIDED",
        },
        {
          title: "TEST point B",
          lat: 52.29,
          lng: 104.29,
          geocodeStatus: "COORDINATES_PROVIDED",
        },
      ],
      publicationApproval: true,
      ownerConfirmed: true,
    },
  ],
  reviews: [
    {
      ownerContentId: "review.test-fixture-01",
      authorName: "Test Author",
      reviewText: "Synthetic review text for unit tests only.",
      date: "2026-01-01",
      source: "TEST_FIXTURE",
      permissionToPublish: true,
      ownerVerificationStatus: "OWNER_VERIFIED",
      publicationApproval: true,
    },
  ],
  guide: {
    ownerContentId: "guide.test-fixture-01",
    name: "Test Guide",
    slug: "test-fixture-guide",
    shortBio: "Synthetic bio.",
    fullBio: "Synthetic full bio for tests.",
    experienceYears: 1,
    specialization: ["history"],
    languages: ["ru"],
    portraitOwnerContentId: "media.test-fixture-01",
    publicationApproval: true,
    ownerConfirmed: true,
  },
  siteSettings: {
    ownerContentId: "site-settings.test-fixture",
    brandName: "TEST FIXTURE Brand",
    publicPhone: "+70000000000",
    publicEmail: "test-fixture@example.invalid",
    messengerLinks: { telegram: "https://t.me/test_fixture_invalid" },
    authorName: "Test Guide",
    publicationApproval: true,
    ownerConfirmed: true,
  },
  media: [
    {
      ownerContentId: "media.test-fixture-01",
      file: "test-fixture-01.jpg",
      originalFilename: "TEST_IMG.jpg",
      normalizedFilename: "irkutsk-other-01.jpg",
      publicationRights: "OWNER_CONFIRMED",
      alt: "Synthetic test image — gray square",
      role: "hero",
      width: 1600,
      height: 900,
      publicationApproval: true,
    },
    {
      ownerContentId: "media.test-fixture-02",
      file: "test-fixture-02.jpg",
      originalFilename: "TEST_IMG_2.jpg",
      publicationRights: "OWNER_CONFIRMED",
      role: "gallery",
      width: 1200,
      height: 800,
      publicationApproval: true,
    },
    {
      ownerContentId: "media.test-fixture-03",
      file: "test-fixture-03.jpg",
      originalFilename: "TEST_IMG_3.jpg",
      publicationRights: "OWNER_CONFIRMED",
      role: "gallery",
      width: 1200,
      height: 800,
      publicationApproval: true,
    },
  ],
  pricingAndBooking: {
    ownerContentId: "pricing-booking.test-fixture",
    howBookingWorks: "TEST: message via form",
    cancellation: "TEST cancel",
    refund: "TEST refund",
    maximumGroup: "2",
    meetingPoint: "TEST meeting",
    contactMethod: "telegram",
    ownerConfirmed: true,
    legalConfirmationRequired: true,
  },
  cmsIdMapping: {},
};

/** Incomplete fixture for missing-field tests. */
export const TEST_FIXTURE_INCOMPLETE: OwnerPack = {
  ...TEST_FIXTURE_PACK,
  packVersion: "test-fixture-incomplete-v0",
  excursions: [
    {
      ownerContentId: "excursion.test-incomplete",
      title: "TEST incomplete",
      shortDescription: "Too short",
      format: "walking",
      price: {
        rawOwnerText: "от 15 тысяч",
        pricingUnit: "unknown",
        currency: "RUB",
      },
    },
  ],
  routes: [
    {
      ownerContentId: "route.test-incomplete",
      title: "TEST route incomplete",
      shortDescription: "Synthetic",
      category: "history",
      points: [{ title: "Точка без координат" }],
    },
  ],
  reviews: [
    {
      ownerContentId: "review.test-unverified",
      authorName: "Ирина",
      reviewText: "Было хорошо",
      // source missing → SOURCE UNVERIFIED
      permissionToPublish: false,
    },
  ],
  media: [
    {
      ownerContentId: "media.test-no-rights",
      file: "x.jpg",
      originalFilename: "IMG_2048.jpg",
      publicationRights: "UNKNOWN",
    },
    {
      ownerContentId: "media.test-dup-a",
      file: "dup.jpg",
      originalFilename: "dup.jpg",
      publicationRights: "OWNER_CONFIRMED",
    },
    {
      ownerContentId: "media.test-dup-b",
      file: "dup.jpg",
      originalFilename: "dup.jpg",
      publicationRights: "OWNER_CONFIRMED",
    },
  ],
  guide: {
    ownerContentId: "guide.test-claims",
    name: "Test",
    shortBio: "bio",
    marketingClaimsRequireConfirmation: ["лучший гид Иркутска"],
  },
  siteSettings: null,
  pricingAndBooking: null,
};
