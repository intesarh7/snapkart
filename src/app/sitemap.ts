import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; 
// ⬆️ Rebuild sitemap every 1 hour (SEO friendly + cache efficient)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://snapkart.in";

  try {
    // 🔥 Direct DB access (NO internal API fetch)
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, updatedAt: true },
    });

    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, updatedAt: true },
    });

    const productUrls = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug || p.id}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const restaurantUrls = restaurants.map((r) => ({
      url: `${baseUrl}/restaurant/${r.slug || r.id}`,
      lastModified: r.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...productUrls,
      ...restaurantUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);

    // Fail-safe: At least homepage return ho
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
