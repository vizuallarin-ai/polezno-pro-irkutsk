import { getSiteUrl } from "@/lib/site-url";

/** robots.txt с директивой Host для Яндекс Вебмастера. */
export function GET(): Response {
  const base = getSiteUrl();
  const host = base.replace(/^https?:\/\//, "");

  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    `Host: ${host}`,
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
