import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/auth";
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

  try {
    const { id, title, priceText, buttonText, buttonLink, image } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Offer ID required" });
    }

    const existingOffer = await prisma.specialOffer.findUnique({
      where: { id: Number(id) },
    });

    if (!existingOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    let imageUrl = existingOffer.image;

    /* ===============================
            📸 NEW IMAGE UPLOAD
    ================================= */

    if (image && image.startsWith("data:image/")) {

      // 🔥 Delete old image from Cloudinary
      if (existingOffer.image) {
        try {
          const publicId = existingOffer.image
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Old image delete error:", err);
        }
      }

      // 🔥 Upload new image
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

    await prisma.specialOffer.update({
      where: { id: Number(id) },
      data: {
        title,
        priceText,
        buttonText,
        buttonLink,
        image: imageUrl,
      },
    });

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("SPECIAL OFFER UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}