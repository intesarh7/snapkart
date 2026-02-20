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
   // 🔐 DELIVERY GUARD
  const delivery = await verifyRole(req, res, ["DELIVERY"]);
  if (!delivery) return;

    const updatedUser = await prisma.user.update({
      where: { id: delivery.id },
      data: {
        isAvailable: !delivery.isAvailable
      }
    })

    return res.status(200).json({
      message: updatedUser.isAvailable
        ? "You are now ONLINE"
        : "You are now OFFLINE",
      isAvailable: updatedUser.isAvailable
    })

  } catch (error) {
    console.error("Toggle Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
