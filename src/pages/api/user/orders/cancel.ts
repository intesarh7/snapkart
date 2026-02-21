import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/auth";
import { processRefund } from "@/lib/payment/payment.service";

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

    const { orderId, reason } = req.body;

    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID required",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { payments: true },
    });

    if (!order || order.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* ===============================
       ⏱ 5 MINUTE CANCEL WINDOW
    ================================= */
    const FIVE_MINUTES = 5 * 60 * 1000;
    const orderTime = new Date(order.createdAt).getTime();
    const now = Date.now();

    if (now - orderTime > FIVE_MINUTES) {
      return res.status(400).json({
        success: false,
        message: "Cancel window expired (5 minutes limit)",
      });
    }

    /* ===============================
       🚫 BLOCK AFTER PREPARING
    ================================= */
    if (
      order.status === "PREPARING" ||
      order.status === "OUT_FOR_DELIVERY" ||
      order.status === "DELIVERED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    /* ===============================
       💳 ONLINE PAYMENT REFUND
    ================================= */
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {
      const payment = order.payments?.[0];

      if (!payment) {
        return res.status(400).json({
          success: false,
          message: "Payment not found",
        });
      }

      await processRefund(payment.id);

      await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          status: "CANCELLED",
          cancelledByRole: "USER",
          cancelReason: reason || "User cancelled",
          cancelledAt: new Date(),
          refundStatus: "REFUNDED",
          refundAmount: order.finalAmount,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Order cancelled & refund initiated",
      });
    }

    /* ===============================
       💵 COD CASE
    ================================= */
    await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: "CANCELLED",
        cancelledByRole: "USER",
        cancelReason: reason || "User cancelled",
        cancelledAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });

  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}