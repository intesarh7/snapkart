import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { verifyRole } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const deliveryBoy = await verifyRole(req, res, ["DELIVERY"]);
if (!deliveryBoy) return;

    const { orderId } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order || order.deliveryBoyId !== deliveryBoy.id) {
      return res.status(404).json({ message: "Order not found" })
    }

    // 🔥 ADD NEW — Only allow when OUT_FOR_DELIVERY
    if (order.status !== "OUT_FOR_DELIVERY") {
      return res.status(400).json({
        message: "Order not ready for delivery completion"
      })
    }

    await prisma.$transaction(async (tx) => {

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "DELIVERED",
          // 🔥 If COD, mark payment as PAID
          paymentStatus:
            order.paymentMethod === "COD"
              ? "PAID"
              : order.paymentStatus
        }
      })

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "DELIVERED",
          changedByRole: "DELIVERY"
        }
      })

      // ======================================================
      // 🔥🔥🔥 ADD NEW — DELIVERY EARNING LOGIC START
      // ======================================================

      const boy = await tx.user.findUnique({
        where: { id: deliveryBoy.id }
      })

      let earningAmount = 0

      if (boy?.commissionType === "PERCENTAGE") {
        earningAmount =
          (order.finalAmount * (boy.commissionValue || 0)) / 100
      } else if (boy?.commissionType === "FLAT") {
        earningAmount = boy.commissionValue || 0
      }

      await tx.deliveryEarning.create({
        data: {
          orderId: order.id,
          deliveryBoyId: deliveryBoy.id,
          orderAmount: order.finalAmount,
          earningAmount
        }
      })

      // ======================================================
      // 🔥🔥🔥 ADD NEW — DELIVERY EARNING LOGIC END
      // ======================================================

    })

    return res.status(200).json({
      message: "Order marked as delivered"
    })

  } catch (error) {
    console.error("Delivery Update Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
