import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const admin = await getUserFromRequest(req)

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" })
    }

    const { orderId } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "CANCELLED") {
      return res.status(400).json({
        message: "Only cancelled orders can be deleted"
      })
    }

    // 🔥 ENTERPRISE SAFE DELETE
    await prisma.$transaction(async (tx) => {

      await tx.orderItem.deleteMany({
        where: { orderId }
      })

      await tx.orderStatusHistory.deleteMany({
        where: { orderId }
      })

      await tx.payment.deleteMany({
        where: { orderId }
      })

      await tx.order.delete({
        where: { id: orderId }
      })

    })

    return res.status(200).json({
      message: "Order deleted successfully"
    })

  } catch (error: any) {
    console.error("Delete Order Error:", error)
    return res.status(500).json({
      message: error.message || "Server error"
    })
  }
}
