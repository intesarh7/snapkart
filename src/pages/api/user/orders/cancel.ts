import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "@/lib/prisma"
import { verifyRole } from "@/lib/auth";
import { processRefund } from "@/lib/payment/payment.service"

export default async function handler(
     req: NextApiRequest,
      res: NextApiResponse
    
) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
   const user = await verifyRole(req, res, ["USER"]);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { orderId, reason } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    })

    if (!order || order.userId !== user.id) {
      return res.status(404).json({ message: "Order not found" })
    }

    // 🔥 ADD NEW — SMART CANCEL RULE (5 MINUTE LIMIT)
    const FIVE_MINUTES = 5 * 60 * 1000
    const orderTime = new Date(order.createdAt).getTime()
    const now = Date.now()

    if (now - orderTime > FIVE_MINUTES) {
      return res.status(400).json({
        message: "Cancel window expired (5 minutes limit)"
      })
    }

    // 🔥 ADD NEW — BLOCK AFTER PREPARING
    if (
      order.status === "PREPARING" ||
      order.status === "OUT_FOR_DELIVERY" ||
      order.status === "DELIVERED"
    ) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage"
      })
    }

    // ❌ Already cancelled
    if (order.status === "CANCELLED") {
      return res.status(400).json({ message: "Order already cancelled" })
    }

    // ===============================
    // 🟢 ONLINE REFUND CASE
    // ===============================
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {

      const payment = order.payments[0]

      if (!payment) {
        return res.status(400).json({ message: "Payment not found" })
      }

      await processRefund(payment.id)

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledByRole: "USER",
          cancelReason: reason || "User cancelled",
          cancelledAt: new Date(),
          refundStatus: "REFUNDED",
          refundAmount: order.finalAmount
        }
      })

      return res.status(200).json({
        message: "Order cancelled & refund initiated"
      })
    }

    // ===============================
    // 🟢 COD CASE
    // ===============================
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledByRole: "USER",
        cancelReason: reason || "User cancelled",
        cancelledAt: new Date(),
      }
    })

    return res.status(200).json({
      message: "Order cancelled successfully"
    })

  } catch (error) {
    console.error("Cancel Order Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
