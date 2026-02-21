import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { OfferType } from "@prisma/client";

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
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json(offers);
  }

  if (req.method === "POST") {
    const { title, description, type, value, isPopup, isMarquee, isActive, expiresAt } =
      req.body;

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        type: type as OfferType,
        value: parseFloat(value),
        isPopup,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isMarquee,
        isActive
      }
    });

    return res.status(201).json(offer);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
