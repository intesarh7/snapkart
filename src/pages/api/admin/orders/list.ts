import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
   const admin = await getUserFromRequest(req)

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        restaurant: true,
        address: true,
        items: {
          include: {
            product: true,
            variant: true   // 🔥 ADD THIS
          }
        },
        deliveryBoy: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        productImage: item.product?.image || null,
        variantName: item.variant?.name || null,
        extras: item.selectedExtras || [],
        finalPrice: Number(item.price || 0)
      }))
    }));

    return res.status(200).json({ orders: formattedOrders })

  } catch (error) {
    console.error("Admin Orders List Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
