import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        products: {
          where: {
            isActive: true,
            isAvailable: true,
          },
          include: {
            variants: true,   // 🔥 VERY IMPORTANT
            extras: true,     // 🔥 VERY IMPORTANT
          },
        },
        deliveryRules: {
          where: { isActive: true },
        },
        bookingSetting: true,
        tables: {
    where: { isActive: true }, // optional if you have isActive
    orderBy: { tableNumber: "asc" },
  },
      },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
