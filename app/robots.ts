import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fluenverse.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/criar-conta", "/esqueci-senha", "/auth", "/logout", "/thank-you", "/api"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
