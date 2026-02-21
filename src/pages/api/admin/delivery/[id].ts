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
  const id = Number(req.query.id);

 if (req.method === "PUT") {
  const data = req.body;

  const updated = await prisma.deliveryRule.update({
    where: { id },
    data: {
      title: data.title,
      restaurantId: Number(data.restaurantId),
      minOrder: Number(data.minOrder),
      maxOrder: data.maxOrder ? Number(data.maxOrder) : null,
      minDistance: Number(data.minDistance),
      maxDistance: data.maxDistance ? Number(data.maxDistance) : null,
      chargeType: data.chargeType,
      chargeAmount:
        data.chargeType === "FREE"
          ? 0
          : Number(data.chargeAmount),

      // 🔥 NEW FIELDS
      baseDistance: data.baseDistance
        ? Number(data.baseDistance)
        : null,

      perKmCharge: data.perKmCharge
        ? Number(data.perKmCharge)
        : null,

      isActive: data.isActive,
    },
  });

  return res.json(updated);
}


  if (req.method === "DELETE") {
    await prisma.deliveryRule.delete({
      where: { id }
    });

    return res.json({ success: true });
  }

  res.status(405).json({ message: "Method not allowed" });
}
