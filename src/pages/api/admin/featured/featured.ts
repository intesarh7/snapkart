import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const featured = await prisma.featured.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    //take: 3,
  });

 res.status(200).json({
  success: true,
  data: featured,
});
}
