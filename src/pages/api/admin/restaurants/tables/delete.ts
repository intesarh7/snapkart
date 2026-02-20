import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function remove(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Table id required" });
    }

    await prisma.restaurantTable.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Deleted" });

  } catch (error) {
    console.error("Delete table error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
