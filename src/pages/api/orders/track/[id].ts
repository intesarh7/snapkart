import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyUser, verifyAdmin } from "@/lib/auth";

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
       🔐 VERIFY ROLE (USER OR ADMIN)
    ================================= */

    let userAuth: any = null;
    let adminAuth: any = null;

    try {
      userAuth = await verifyUser(req);
    } catch {}

    try {
      adminAuth = await verifyAdmin(req);
    } catch {}

    if (!userAuth?.success && !adminAuth?.success) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const currentUser = userAuth?.success ? userAuth.user : null;
    const currentAdmin = adminAuth?.success ? adminAuth.user : null;

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
        deliveryBoy: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
          },
        },
        address: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* ===============================
       🔐 ACCESS CONTROL
    ================================= */

    // 👤 If USER → can only track own order
    if (currentUser) {
      if (order.userId !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to track this order",
        });
      }
    }

    // 🛠 If ADMIN → full access allowed
    // (no restriction needed)

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