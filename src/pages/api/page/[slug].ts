import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  const page = await prisma.page.findUnique({
    where: { slug: String(slug) },
  });

  if (!page) {
    return res.status(404).json({ message: "Page not found" });
  }

  res.json(page);
}
