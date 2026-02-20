import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          bookingSetting: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(restaurants);
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("Restaurant fetch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
