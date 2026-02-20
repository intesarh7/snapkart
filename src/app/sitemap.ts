import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://snapkart.in";

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true }, // 🔥 slug removed
    });

    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true }, // 🔥 slug removed
    });

    const productUrls = products.map((p) => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: p.updatedAt ?? new Date(),
    }));

    const restaurantUrls = restaurants.map((r) => ({
      url: `${baseUrl}/restaurant/${r.id}`,
      lastModified: r.updatedAt ?? new Date(),
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      ...productUrls,
      ...restaurantUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }
}
