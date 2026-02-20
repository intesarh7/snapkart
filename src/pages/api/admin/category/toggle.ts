import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { id } = req.query;

    if (!id)
      return res.status(400).json({ message: "ID required" });

    const existing = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!existing)
      return res.status(404).json({ message: "Category not found" });

    await prisma.category.update({
      where: { id: Number(id) },
      data: {
        active: !existing.active,
      },
    });

    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
