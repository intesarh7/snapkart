import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { restaurantId, tableNumber, capacity, location } =
      req.body;

    if (!restaurantId || !tableNumber || !capacity || !location) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Prevent duplicate table number per restaurant
    const existing = await prisma.restaurantTable.findFirst({
      where: {
        restaurantId: Number(restaurantId),
        tableNumber,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Table number already exists",
      });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        restaurantId: Number(restaurantId),
        tableNumber,
        capacity: Number(capacity),
        location, // must match enum INSIDE / OUTSIDE
        isActive: true,
      },
    });

    return res.status(200).json(table);

  } catch (error) {
    console.error("Create table error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
