import { getSiteUrl } from "@/lib/site-url";

/** robots.txt with Yandex Host directive and private-route disallow. */
export function GET(): Response {
  const base = getSiteUrl();
  const host = base.replace(/^https?:\/\//, "");

  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /souvenirs/success",
    "Disallow: /souvenirs/submit-maker",
    "Disallow: /explore/photos/submit",
    "",
    `Host: ${host}`,
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
