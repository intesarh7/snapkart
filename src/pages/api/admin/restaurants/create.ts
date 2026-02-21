import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
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

  // 🔐 ADMIN AUTH CHECK
  const admin = verifyAdmin(req, res);
  if (!admin) return;

  try {
    const token = req.cookies.snapkart_token;

    if (!token)
      return res.status(401).json({ message: "Unauthorized" });

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (decoded.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    const {
      name,
      address,
      city,
      latitude,
      longitude,
      isActive,
      isOpen,

      // 🔥 NEW FIELDS
      openTime,
      closeTime,
      rating,
      deliveryTime,
      addOffer,

      // 🔥 IMAGE (Base64)
      image,
    } = req.body;

    const parsedDeliveryTime = Array.isArray(deliveryTime)
      ? deliveryTime[0]
      : deliveryTime;

    const parsedRating = Array.isArray(rating)
      ? rating[0]
      : rating;

    // ☁️ Upload to Cloudinary (if image provided)
    let imageUrl: string | null = null;

    if (image && image.startsWith("data:image/")) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "snapkart/restaurant",
        resource_type: "image",
        transformation: [
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      imageUrl = uploadResponse.secure_url;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        address,
        city: city || "Unknown",
        latitude: Number(latitude),
        longitude: Number(longitude),
        isActive: isActive === "true",
        isOpen: isOpen === "true",
        image: imageUrl,

        // 🔥 NEW FIELDS SAVED
        openTime: openTime || null,
        closeTime: closeTime || null,
        deliveryTime:
          typeof parsedDeliveryTime === "string"
            ? parsedDeliveryTime.trim()
            : null,

        rating:
          parsedRating &&
          parsedRating.toString().trim() !== ""
            ? Number(parsedRating)
            : 0,

        addOffer: addOffer || null,
      },
    });

    return res.status(201).json({
      success: true,
      restaurant,
    });

  } catch (error: any) {
    console.error("Restaurant Create Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
}