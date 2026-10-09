import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://sportsportal.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en/", "/fa/"],
        disallow: [
          "/admin/",
          "/en/admin/",
          "/fa/admin/",
          "/dashboard/",
          "/en/dashboard/",
          "/fa/dashboard/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
