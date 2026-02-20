import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) reject(result);
      resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  await runMiddleware(req, res, upload.single("image"));

  const { title, priceText, buttonText, buttonLink } = req.body;

  let imagePath = null;

  if ((req as any).file) {
    const uploadDir = path.join(process.cwd(), "public/uploads/offers");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `offer-${Date.now()}.webp`;
    const fullPath = path.join(uploadDir, fileName);

    await sharp((req as any).file.buffer)
      .resize(1920, 800, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(fullPath);

    imagePath = `/uploads/offers/${fileName}`;
  }

  await prisma.specialOffer.create({
    data: { title, priceText, buttonText, buttonLink, image: imagePath },
  });

  res.status(201).json({ success: true });
}
