import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
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

    const { id } = req.query;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(id) },
    });

    if (!restaurant)
      return res.status(404).json({ message: "Not found" });

    const {
      name,
      address,
      latitude,
      longitude,
      isActive,
      isOpen,
      openTime,
      closeTime,
      rating,
      deliveryTime,
      addOffer,
      image,
    } = req.body;

    let imageUrl = restaurant.image;

    // 🔥 If new image provided → upload to Cloudinary
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

    await prisma.restaurant.update({
      where: { id: Number(id) },
      data: {
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        isActive: Boolean(isActive),
        isOpen: Boolean(isOpen),
        image: imageUrl,
        openTime: openTime || null,
        closeTime: closeTime || null,
        deliveryTime: deliveryTime || null,
        rating:
          rating && rating.toString().trim() !== ""
            ? Number(rating)
            : 0,
        addOffer: addOffer || null,
      },
    });

    return res.status(200).json({
      success: true,
    });

  } catch (error: any) {
    console.error("Restaurant Update Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
}