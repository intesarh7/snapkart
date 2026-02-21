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

    const deliveryBoy = auth.user;

    /* ===============================
       🆔 VALIDATE ORDER ID
    ================================= */
    const { orderId } = req.body;

    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID required",
      });
    }

    const numericOrderId = Number(orderId);

    /* ===============================
       🔎 FETCH ORDER
    ================================= */
    const order = await prisma.order.findUnique({
      where: { id: numericOrderId },
    });

    if (!order || order.deliveryBoyId !== deliveryBoy.id) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* ===============================
       🚫 PREVENT DOUBLE DELIVERY
    ================================= */
    if (order.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Order already delivered",
      });
    }

    if (order.status !== "OUT_FOR_DELIVERY") {
      return res.status(400).json({
        success: false,
        message: "Order not ready for delivery completion",
      });
    }

    /* ===============================
       💰 TRANSACTION SAFE UPDATE
    ================================= */
    await prisma.$transaction(async (tx) => {

      // Update Order
      await tx.order.update({
        where: { id: numericOrderId },
        data: {
          status: "DELIVERED",
          paymentStatus:
            order.paymentMethod === "COD"
              ? "PAID"
              : order.paymentStatus,
        },
      });

      // Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: numericOrderId,
          status: "DELIVERED",
          changedByRole: "DELIVERY",
        },
      });

      /* ===============================
         💵 DELIVERY EARNING CALCULATION
      ================================= */
      const boy = await tx.user.findUnique({
        where: { id: deliveryBoy.id },
        select: {
          commissionType: true,
          commissionValue: true,
        },
      });

      let earningAmount = 0;

      if (boy?.commissionType === "PERCENTAGE") {
        earningAmount =
          (order.finalAmount * (boy.commissionValue || 0)) / 100;
      } else if (boy?.commissionType === "FLAT") {
        earningAmount = boy.commissionValue || 0;
      }

      // Prevent duplicate earning
      const existingEarning = await tx.deliveryEarning.findFirst({
        where: { orderId: numericOrderId },
      });

      if (!existingEarning) {
        await tx.deliveryEarning.create({
          data: {
            orderId: numericOrderId,
            deliveryBoyId: deliveryBoy.id,
            orderAmount: order.finalAmount,
            earningAmount,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Order marked as delivered",
    });

  } catch (error) {
    console.error("Delivery Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}