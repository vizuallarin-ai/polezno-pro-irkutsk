import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
