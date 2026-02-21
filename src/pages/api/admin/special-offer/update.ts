import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/auth";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });

  /* ===============================
            🔐 VERIFY ADMIN
   ================================= */
   const auth = await verifyAdmin(req);
 
   if (!auth.success) {
     return res.status(auth.status).json({
       success: false,
       message: auth.message,
     });
   }
 
  await runMiddleware(req, res, upload.single("image"));

  const { id, title, priceText, buttonText, buttonLink } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Offer ID required" });
  }

  const existingOffer = await prisma.specialOffer.findUnique({
    where: { id: Number(id) },
  });

  if (!existingOffer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  let imagePath = existingOffer.image;

  if ((req as any).file) {
    const uploadDir = path.join(process.cwd(), "public/uploads/offers");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `offer-${Date.now()}.webp`;
    const fullPath = path.join(uploadDir, fileName);

    await sharp((req as any).file.buffer)
      .resize(1920, 800, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(fullPath);

    imagePath = `/uploads/offers/${fileName}`;

    // 🔥 Old image delete (optional but professional)
    if (existingOffer.image) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        existingOffer.image
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  }

  await prisma.specialOffer.update({
    where: { id: Number(id) },
    data: {
      title,
      priceText,
      buttonText,
      buttonLink,
      image: imagePath,
    },
  });

  res.status(200).json({ success: true });
}
