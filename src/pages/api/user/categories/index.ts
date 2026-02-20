import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        active: true,
        products: {
          some: {
            isActive: true, // only categories having active products
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc", // 🔥 Most products first
        },
      },
      take: 6, // 👈 Top 6 categories with highest product count
      select: {
        id: true,
        name: true,
        image: true,
        restaurantId: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.status(200).json(categories);
  } catch (error: any) {
    console.error("Category fetch error:", error);
    res.status(500).json({ message: error.message });
  }
}
