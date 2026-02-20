import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { verifyRole } from "@/lib/auth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const deliveryBoy = await verifyRole(req, res, ["DELIVERY"]);
if (!deliveryBoy) return;

    const orders = await prisma.order.findMany({
      where: {
        deliveryBoyId: deliveryBoy.id,
        status: "OUT_FOR_DELIVERY"
      },
      include: {
        user: true,
        address: true,
        restaurant: true
      },
      orderBy: { createdAt: "desc" }
    })

    return res.status(200).json({ orders })

  } catch (error) {
    console.error("Delivery Orders Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
