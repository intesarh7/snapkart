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

    const delivery = auth.user;

    /* ===============================
       📥 GET PROFILE
    ================================= */
    if (req.method === "GET") {
      const profile = await prisma.user.findUnique({
        where: { id: delivery.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          isAvailable: true,
          maxActiveOrders: true,
          commissionType: true,
          commissionValue: true,
          latitude: true,
          longitude: true,
        },
      });

      return res.status(200).json({
        success: true,
        profile,
      });
    }

    /* ===============================
       ✏ UPDATE PROFILE
    ================================= */
    if (req.method === "PUT") {
      const { name, phone, image, isAvailable } = req.body;

      const updateData: any = {};

      if (name && typeof name === "string") {
        updateData.name = name.trim();
      }

      if (phone && typeof phone === "string") {
        updateData.phone = phone.trim();
      }

      if (typeof isAvailable === "boolean") {
        updateData.isAvailable = isAvailable;
      }

      /* ===============================
         🖼 IMAGE UPDATE (Cloudinary)
      ================================= */
      if (image && typeof image === "string") {
        // Get existing image
        const existingUser = await prisma.user.findUnique({
          where: { id: delivery.id },
        });

        // Delete old image from Cloudinary
        if (existingUser?.image?.includes("cloudinary")) {
          try {
            const publicId = existingUser.image
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];

            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.log("Old image delete failed:", err);
          }
        }

        // Upload new image
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "snapkart/delivery",
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        });

        updateData.image = uploadResponse.secure_url;
      }

      await prisma.user.update({
        where: { id: delivery.id },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });

  } catch (error) {
    console.error("Delivery profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}