import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function get(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, restaurantId } = req.query;

    /* ===== GET SINGLE TABLE ===== */
    if (id) {
      const table = await prisma.restaurantTable.findUnique({
        where: { id: Number(id) },
      });

      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      return res.status(200).json(table);
    }

    /* ===== GET ALL TABLES BY RESTAURANT ===== */
    if (restaurantId) {
      const tables = await prisma.restaurantTable.findMany({
        where: {
          restaurantId: Number(restaurantId),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(tables);
    }

    return res.status(400).json({
      message: "Provide id or restaurantId",
    });

  } catch (error) {
    console.error("Get table error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
