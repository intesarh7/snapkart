import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        isPopup: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(offers);
  } catch (error) {
    console.error("Offer API Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
