import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function list(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId required" });
    }

    const tables = await prisma.restaurantTable.findMany({
      where: {
        restaurantId: Number(restaurantId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(tables);

  } catch (error) {
    console.error("List table error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
