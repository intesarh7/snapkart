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

    const deliveryBoys = await prisma.user.findMany({
      where: {
        role: "DELIVERY",
        isActive: true
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isAvailable: true,
        maxActiveOrders: true
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    return res.status(200).json({
      deliveryBoys
    })

  } catch (error) {
    console.error("Delivery List Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
