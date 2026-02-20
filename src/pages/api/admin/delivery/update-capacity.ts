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

    // 🔥 FIX — destructure ALL fields
    const {
      deliveryBoyId,
      maxActiveOrders,
      commissionType,
      commissionValue
    } = req.body

    if (!deliveryBoyId) {
      return res.status(400).json({ message: "Delivery boy id required" })
    }

    const deliveryBoy = await prisma.user.findFirst({
      where: {
        id: Number(deliveryBoyId),
        role: "DELIVERY"
      }
    })

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" })
    }

    // 🔥 FIX — build dynamic update object
    const updateData: any = {}

    if (maxActiveOrders !== undefined) {
      updateData.maxActiveOrders = Number(maxActiveOrders)
    }

    if (commissionType) {
      updateData.commissionType = commissionType
    }

    if (commissionValue !== undefined) {
      updateData.commissionValue = Number(commissionValue)
    }

    await prisma.user.update({
      where: { id: Number(deliveryBoyId) },
      data: updateData
    })

    return res.status(200).json({
      message: "Delivery settings updated successfully"
    })

  } catch (error) {
    console.error("Update Capacity Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
