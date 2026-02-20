import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = verifyAdmin(req, res);
  if (!admin) return;

  const featured = await prisma.featured.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(featured);
}
