import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {

    const admin = await verifyAdmin(req)

     /* ===============================
         🔐 VERIFY ADMIN
      ================================= */
      const auth = await verifyAdmin(req);
    
      if (!auth.success) {
        return res.status(auth.status).json({
          success: false,
          message: auth.message,
        });
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
