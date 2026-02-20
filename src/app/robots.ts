import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://snapkart.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: [
          "/admin/",
          "/delivery/",
          "/api/",
          "/user/account/",
          "/user/orders/",
          "/user/track/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}