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
   const user = await verifyRole(req, res, ["ADMIN", "DELIVERY"]);
    if (!user) return;

    if (!user || user.role !== "DELIVERY") {
      return res.status(403).json({ message: "Forbidden" })
    }
    

    const { latitude, longitude } = req.body

    await prisma.user.update({
      where: { id: user.id },
      data: {
        latitude,
        longitude,
        lastLocationUpdate: new Date()
      }
    })

    return res.status(200).json({ message: "Location updated" })

  } catch (error) {
    console.error("Location Update Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
