import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login", "/pos"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://thebikrgenome.com"}/sitemap.xml`,
  };
}
