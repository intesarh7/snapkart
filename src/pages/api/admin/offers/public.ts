import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler( req: NextApiRequest,
  res: NextApiResponse
){
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const now = new Date();

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        isMarquee: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ offers });

  } catch (error) {
    console.error("Public Offers Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
