import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const featured = await prisma.featured.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(featured);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
