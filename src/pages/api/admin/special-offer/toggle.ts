import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

 const admin = await verifyRole(req, res, ["ADMIN"]);
  if (!admin) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Offer ID required" });
  }

  const offer = await prisma.specialOffer.findUnique({
    where: { id: Number(id) },
  });

  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  const updated = await prisma.specialOffer.update({
    where: { id: Number(id) },
    data: {
      active: !offer.active,
    },
  });

  return res.status(200).json({
    success: true,
    active: updated.active,
  });
}
