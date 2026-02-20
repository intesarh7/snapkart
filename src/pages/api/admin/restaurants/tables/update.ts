import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function update(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, tableNumber, capacity, location, isActive } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Table id required" });
    }

    const updated = await prisma.restaurantTable.update({
      where: { id: Number(id) },
      data: {
        tableNumber,
        capacity: Number(capacity),
        location,
        isActive,
      },
    });

    return res.status(200).json(updated);

  } catch (error) {
    console.error("Update table error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
