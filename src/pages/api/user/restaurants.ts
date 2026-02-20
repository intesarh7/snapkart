import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isActive: true
      },
      include: {
        products: {
          where: {
            isActive: true
          },
          take: 4
        },
        deliveryRules: {
          where: { isActive: true },
          orderBy: { minOrder: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json(restaurants);
  } catch (error) {
    console.error(error);
    return res.status(500).json([]);
  }
}
