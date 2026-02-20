import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

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

    const { orderId, status } = req.body

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    await prisma.$transaction(async (tx) => {

      let assignedDeliveryBoyId = order.deliveryBoyId

      // 🔥 AUTO ASSIGN WHEN DISPATCHING
      if (status === "OUT_FOR_DELIVERY") {

        const deliveryBoys = await tx.user.findMany({
          where: {
            role: "DELIVERY",
            isActive: true,
            isAvailable: true
          },
          orderBy: {
            updatedAt: "asc"
          }
        })

        if (deliveryBoys.length === 0) {
          throw new Error("No delivery boy available")
        }

        let assignedBoy = null

        for (const boy of deliveryBoys) {

          // 🔥 Count only active deliveries
          const activeOrders = await tx.order.count({
            where: {
              deliveryBoyId: boy.id,
              status: "OUT_FOR_DELIVERY"
            }
          })

          if (activeOrders < boy.maxActiveOrders) {
            assignedBoy = boy
            break
          }
        }

        if (!assignedBoy) {
          throw new Error("All delivery boys reached max order capacity")
        }

        assignedDeliveryBoyId = assignedBoy.id
      }

      await tx.order.update({
        where: { id: Number(orderId) },
        data: {
          status,
          deliveryBoyId: assignedDeliveryBoyId
        }
      })

      await tx.orderStatusHistory.create({
        data: {
          orderId: Number(orderId),
          status,
          changedByRole: "ADMIN"
        }
      })

    })

    return res.status(200).json({
      message: "Order status updated successfully"
    })

  } catch (error: any) {
    console.error("Status Update Error:", error)
    return res.status(500).json({
      message: error.message || "Server error"
    })
  }
}
