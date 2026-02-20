import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = verifyAdmin(req, res);
  if (!admin) return;

  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(pages);
}
