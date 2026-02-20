import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { processRefund } from "@/lib/payment/payment.service"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const admin = await getUserFromRequest(req)

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" })
    }

    const { orderId, refundAmount } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({ message: "Already cancelled" })
    }

    // ONLINE REFUND
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {

      const payment = order.payments[0]

      if (!payment) {
        return res.status(400).json({ message: "Payment not found" })
      }

      const amountToRefund =
        refundAmount && refundAmount > 0
          ? refundAmount
          : order.finalAmount

      await processRefund(payment.id, amountToRefund)

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledByRole: "ADMIN",
          cancelledAt: new Date(),
          refundAmount: amountToRefund,
          refundStatus: "REFUNDED"
        }
      })

      return res.status(200).json({
        message: "Order cancelled & refund processed"
      })
    }

   // COD CASE
const amountToRefund =
  refundAmount && refundAmount > 0
    ? refundAmount
    : order.finalAmount

await prisma.order.update({
  where: { id: orderId },
  data: {
    status: "CANCELLED",
    cancelledByRole: "ADMIN",
    cancelledAt: new Date(),
    refundAmount: amountToRefund,      // 🔥 ADD
    refundStatus: "REFUNDED"           // 🔥 ADD
  }
})

    return res.status(200).json({
      message: "Order cancelled successfully"
    })

  } catch (error) {
    console.error("Admin Cancel Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
