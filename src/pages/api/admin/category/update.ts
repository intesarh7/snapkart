import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import multer from "multer";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: { bodyParser: false },
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

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  await runMiddleware(req, res, upload.single("image"));

  const { id, name, restaurantId } = req.body;

  if (!id || !name || !restaurantId) {
    return res.status(400).json({
      success: false,
      message: "Id, name and restaurant required",
    });
  }

  try {
    let imagePath: string | undefined = undefined;

    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if ((req as any).file) {
      const file = (req as any).file;

      // Delete old image
      if (existingCategory?.image) {
        const publicId = existingCategory.image
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(publicId);
      }

      const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const uploaded = await cloudinary.uploader.upload(base64, {
        folder: "snapkart/categories",
        transformation: [
          { width: 300, height: 300, crop: "fill" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      imagePath = uploaded.secure_url;
    }

    await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        restaurantId: Number(restaurantId),
        ...(imagePath && { image: imagePath }),
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