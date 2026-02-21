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
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  try {
    const { title, priceText, buttonText, buttonLink, image } = req.body;

    let imageUrl = null;

    /* -------- Cloudinary Upload -------- */

    if (image && image.startsWith("data:image/")) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "snapkart/special-offers",
        resource_type: "image",
        transformation: [
          { width: 1920, height: 800, crop: "fill" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      imageUrl = uploadResponse.secure_url;
    }

    await prisma.specialOffer.create({
      data: {
        title,
        priceText,
        buttonText,
        buttonLink,
        image: imageUrl,
      },
    });

    return res.status(201).json({ success: true });

  } catch (error: any) {
    console.error("SPECIAL OFFER CREATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}