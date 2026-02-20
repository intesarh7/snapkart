import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 🔐 DELIVERY GUARD
  const delivery = await verifyRole(req, res, ["DELIVERY"]);
  if (!delivery) return;

  try {
    /* ===============================
       GET PROFILE
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

      return res.status(200).json({ profile });
    }

    /* ===============================
       UPDATE PROFILE
    ================================= */
    if (req.method === "PUT") {
      const { name, phone, image, isAvailable } = req.body;

      await prisma.user.update({
        where: { id: delivery.id },
        data: {
          name,
          phone,
          image,
          isAvailable,
        },
      });

      return res.status(200).json({
        message: "Profile updated successfully",
      });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("Delivery profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}