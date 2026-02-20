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
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ FIXED: method should be PUT
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  await runMiddleware(req, res, upload.single("image"));

  const { id, name, restaurantId } = req.body;

  // ✅ FIXED: id required
  if (!id || !name || !restaurantId) {
    return res.status(400).json({
      success: false,
      message: "Id, name and restaurant required",
    });
  }

  try {
    let imagePath: string | undefined = undefined;

    // ✅ If new image uploaded
    if ((req as any).file) {
      const file = (req as any).file;

      const uploadDir = path.join(
        process.cwd(),
        "public/uploads/categories"
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `cat-${Date.now()}.webp`;
      const fullPath = path.join(uploadDir, fileName);

      await sharp(file.buffer)
        .resize(300, 300, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(fullPath);

      imagePath = `/uploads/categories/${fileName}`;
    }

    // ✅ FIXED: use update instead of create
    await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        restaurantId: Number(restaurantId),
        ...(imagePath && { image: imagePath }), // only update image if new uploaded
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
