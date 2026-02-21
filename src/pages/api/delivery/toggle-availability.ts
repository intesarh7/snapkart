import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyDelivery } from "@/lib/auth";

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

    /* ===============================
       🔄 FETCH LATEST STATE
    ================================= */
    const currentUser = await prisma.user.findUnique({
      where: { id: deliveryUser.id },
      select: { isAvailable: true },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ===============================
       🔁 TOGGLE
    ================================= */
    const updatedUser = await prisma.user.update({
      where: { id: deliveryUser.id },
      data: {
        isAvailable: !currentUser.isAvailable,
      },
    });

    return res.status(200).json({
      success: true,
      message: updatedUser.isAvailable
        ? "You are now ONLINE"
        : "You are now OFFLINE",
      isAvailable: updatedUser.isAvailable,
    });

  } catch (error) {
    console.error("Toggle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}