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

 const delivery = await getUserFromRequest(req)

  if (!delivery || delivery .role !== "DELIVERY") {
    return res.status(403).json({ message: "Forbidden" })
  }

  const earnings = await prisma.deliveryEarning.findMany({
    where: { deliveryBoyId: delivery.id },
    include: { order: true },
    orderBy: { createdAt: "desc" }
  })

  const totalEarning = earnings.reduce(
    (sum, e) => sum + e.earningAmount,
    0
  ) 

  return res.status(200).json({
    earnings,
    totalEarning
  })
}
