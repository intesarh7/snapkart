import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyDelivery } from "@/lib/auth";

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

      if (image && typeof image === "string") {
        updateData.image = image;
      }

      if (typeof isAvailable === "boolean") {
        updateData.isAvailable = isAvailable;
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