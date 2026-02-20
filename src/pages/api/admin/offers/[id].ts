import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { OfferType } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await verifyRole(req, res, ["ADMIN"]);
      if (!admin) return;

  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const { title, description, type, value, isPopup, isMarquee, isActive, expiresAt } =
      req.body;

    const updated = await prisma.offer.update({
      where: { id },
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

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.offer.delete({ where: { id } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
