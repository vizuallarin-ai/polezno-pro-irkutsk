import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

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
        destination: "/map?filter=guided",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "irkportal.ru",
        "www.irkportal.ru",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
    ...(process.env.PHASE15_DB_POOL_MAX ? { cpus: 1 } : {}),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "irkportal.ru" },
      { protocol: "https", hostname: "www.irkportal.ru" },
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
