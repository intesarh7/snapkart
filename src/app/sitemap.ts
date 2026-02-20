import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://snapkart.in";

  let products: any[] = [];
  let restaurants: any[] = [];

  try {
    const productRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`,
      { cache: "no-store" }
    );

    const restaurantRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/restaurants`,
      { cache: "no-store" }
    );

    products = productRes.ok ? await productRes.json() : [];
    restaurants = restaurantRes.ok ? await restaurantRes.json() : [];
  } catch (error) {
    console.error("Sitemap fetch error:", error);
  }

  const productUrls =
    Array.isArray(products)
      ? products.map((p) => ({
          url: `${baseUrl}/product/${p.slug || p.id}`,
          lastModified: new Date(),
        }))
      : [];

  const restaurantUrls =
    Array.isArray(restaurants)
      ? restaurants.map((r) => ({
          url: `${baseUrl}/restaurant/${r.slug || r.id}`,
          lastModified: new Date(),
        }))
      : [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...productUrls,
    ...restaurantUrls,
  ];
}