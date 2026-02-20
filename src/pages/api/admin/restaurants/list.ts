import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  res.status(200).json(restaurants);
}
