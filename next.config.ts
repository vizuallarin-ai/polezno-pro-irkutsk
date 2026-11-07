import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import { DEFAULT_SITE_HOST } from "./lib/site-url";

const nextConfig: NextConfig = {
  env: {
    GIT_COMMIT_SHA:
      process.env.GIT_COMMIT_SHA ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      "",
    BUILD_TIMESTAMP:
      process.env.BUILD_TIMESTAMP ||
      process.env.VERCEL_BUILD_COMPLETED_AT ||
      "",
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/souvenirs",
        permanent: true,
      },
      {
        source: "/shop/success",
        destination: "/souvenirs/success",
        permanent: true,
      },
      {
        source: "/shop/:slug",
        destination: "/souvenirs/:slug",
        permanent: true,
      },
      {
        source: "/program",
        destination: "/business",
        permanent: true,
      },
      {
        source: "/for-companies",
        destination: "/business",
        permanent: true,
      },
      {
        source: "/excursions",
        destination: "/map",
        permanent: true,
      },
    ];
  },
  experimental: {
    globalNotFound: true,
    serverActions: {
      allowedOrigins: [
        DEFAULT_SITE_HOST,
        `www.${DEFAULT_SITE_HOST}`,
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
    ...(process.env.PHASE15_DB_POOL_MAX ? { cpus: 1 } : {}),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: DEFAULT_SITE_HOST },
      { protocol: "https", hostname: `www.${DEFAULT_SITE_HOST}` },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "yandex.ru" },
      { protocol: "https", hostname: "**.yandex.ru" },
      { protocol: "https", hostname: "**.yandex.net" },
    ],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
