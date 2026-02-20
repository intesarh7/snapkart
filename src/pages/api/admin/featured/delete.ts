import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ message: "Method not allowed" });

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;

  const item = await prisma.featured.findUnique({
    where: { id: Number(id) },
  });

  if (!item) return res.status(404).json({ message: "Not found" });

  if (item.image) {
    const imgPath = path.join(process.cwd(), "public", item.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await prisma.featured.delete({
    where: { id: Number(id) },
  });

  res.status(200).json({ success: true });
}
