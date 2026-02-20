import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { restaurantId } = req.query;

  if (!restaurantId)
    return res.status(400).json({ message: "Restaurant required" });

  const categories = await prisma.category.findMany({
    where: { restaurantId: Number(restaurantId) },
  });

  res.status(200).json(categories);
}
