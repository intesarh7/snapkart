import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { verifyRole } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {

   const user = await verifyRole(req, res, ["USER"]);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { id } = req.query

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        deliveryBoy: true,
        restaurant: true,
        address: true
      }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    return res.status(200).json({
      deliveryLat: order.deliveryBoy?.latitude,
      deliveryLng: order.deliveryBoy?.longitude,
      restaurantLat: order.restaurant?.latitude,
      restaurantLng: order.restaurant?.longitude,
      customerLat: order.address?.latitude,
      customerLng: order.address?.longitude
    })

  } catch (error) {
    console.error("Tracking Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
