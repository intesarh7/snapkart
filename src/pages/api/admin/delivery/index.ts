import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

   
  if (req.method === "GET") {
    const rules = await prisma.deliveryRule.findMany({
      include: { restaurant: true },
      orderBy: { createdAt: "desc" }
    });

    return res.json(rules);
  }

  if (req.method === "POST") {
    const data = req.body;

    const rule = await prisma.deliveryRule.create({
      data: {
        title: data.title,
        restaurantId: Number(data.restaurantId),
        minOrder: Number(data.minOrder),
        maxOrder: data.maxOrder ? Number(data.maxOrder) : null,
        minDistance: Number(data.minDistance),
        maxDistance: data.maxDistance ? Number(data.maxDistance) : null,
        chargeType: data.chargeType,
        chargeAmount: Number(data.chargeAmount),
        baseDistance: data.baseDistance ? Number(data.baseDistance) : null,
        perKmCharge: data.perKmCharge ? Number(data.perKmCharge) : null,
        isActive: data.isActive
      }
    });

    return res.json(rule);
  }

  res.status(405).json({ message: "Method not allowed" });
}
