import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

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

  try {
    const { id, title, tag, price, image } = req.body;

    if (!id || !title) {
      return res.status(400).json({
        success: false,
        message: "ID and Title are required",
      });
    }

    const existingItem = await prisma.featured.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Featured item not found",
      });
    }

    let imageUrl = existingItem.image;

    /* ===============================
            📸 NEW IMAGE UPLOAD
    ================================= */

    if (image && image.startsWith("data:image/")) {

      // 🔥 Delete old image from Cloudinary
      if (existingItem.image) {
        try {
          const publicId = existingItem.image
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Old featured image delete error:", err);
        }
      }

      // 🔥 Upload new image
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "snapkart/featured",
        resource_type: "image",
        transformation: [
          { width: 800, height: 500, crop: "fill" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      imageUrl = uploadResponse.secure_url;
    }

    await prisma.featured.update({
      where: { id: Number(id) },
      data: {
        title,
        tag,
        price: price ? Number(price) : null,
        image: imageUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Featured updated successfully",
    });

  } catch (error: any) {
    console.error("FEATURED UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}