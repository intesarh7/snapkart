import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyDelivery } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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

    const deliveryBoy = auth.user;

    /* ===============================
       📦 FETCH ACTIVE DELIVERY ORDERS
    ================================= */
    const orders = await prisma.order.findMany({
      where: {
        deliveryBoyId: deliveryBoy.id,
        status: "OUT_FOR_DELIVERY",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        finalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        address: {
          select: {
            latitude: true,
            longitude: true,
          },
        },

        restaurant: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error("Delivery Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}