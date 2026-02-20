import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 🔐 ADMIN AUTH CHECK
  const admin = verifyAdmin(req, res);
  if (!admin) return;

  await runMiddleware(req, res, upload.single("image"));

  const { id, title, tag, price } = req.body;

  if (!id || !title) {
    return res.status(400).json({
      success: false,
      message: "ID and Title are required",
    });
  }

  try {
    const existingItem = await prisma.featured.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Featured item not found",
      });
    }

    let imagePath = existingItem.image;

    // 🔥 If new image uploaded
    if ((req as any).file) {
      const file = (req as any).file;

      const uploadDir = path.join(
        process.cwd(),
        "public/uploads/featured"
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `featured-${Date.now()}.webp`;
      const fullPath = path.join(uploadDir, fileName);

      // Resize + Convert to WebP
      await sharp(file.buffer)
        .resize(800, 500, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(fullPath);

      imagePath = `/uploads/featured/${fileName}`;

      // 🗑 Delete old image if exists
      if (existingItem.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          existingItem.image
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await prisma.featured.update({
      where: { id: Number(id) },
      data: {
        title,
        tag,
        price: price ? Number(price) : null,
        image: imagePath,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Featured updated successfully",
    });
  } catch (error: any) {
    console.error("Update Featured Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
