import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/auth";

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
       🔐 VERIFY USER
    ================================= */
    const auth = await verifyUser(req);

    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    const user = auth.user;

    /* ===============================
       🆔 VALIDATE ORDER ID
    ================================= */
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID required",
      });
    }

    const orderId = Number(id);

    /* ===============================
       🔎 FETCH ORDER
    ================================= */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryBoy: true,
        restaurant: true,
        address: true,
      },
    });

    if (!order || order.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* ===============================
       📍 RETURN TRACKING DATA
    ================================= */
    return res.status(200).json({
      success: true,
      deliveryLat: order.deliveryBoy?.latitude ?? null,
      deliveryLng: order.deliveryBoy?.longitude ?? null,
      restaurantLat: order.restaurant?.latitude ?? null,
      restaurantLng: order.restaurant?.longitude ?? null,
      customerLat: order.address?.latitude ?? null,
      customerLng: order.address?.longitude ?? null,
    });

  } catch (error) {
    console.error("Tracking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}