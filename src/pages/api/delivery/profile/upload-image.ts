import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyDelivery } from "@/lib/auth";
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
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    /* ===============================
       🔐 VERIFY DELIVERY
    ================================= */
    const auth = await verifyDelivery(req);

    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    const deliveryUser = auth.user;

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    /* ===============================
       📤 UPLOAD TO CLOUDINARY
    ================================= */
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "snapkart/delivery",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    /* ===============================
       🗑 DELETE OLD IMAGE (if exists)
    ================================= */
    const existingUser = await prisma.user.findUnique({
      where: { id: deliveryUser.id },
    });

    if (existingUser?.image?.includes("cloudinary")) {
      const publicId = existingUser.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId);
    }

    /* ===============================
       💾 UPDATE USER IMAGE
    ================================= */
    await prisma.user.update({
      where: { id: deliveryUser.id },
      data: { image: uploadResponse.secure_url },
    });

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      image: uploadResponse.secure_url,
    });

  } catch (error) {
    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}