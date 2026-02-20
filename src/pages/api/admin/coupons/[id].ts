import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { CouponType } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await verifyRole(req, res, ["ADMIN"]);
  if (!admin) return;

  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const { title, description, code, type, value, isActive, expiresAt } =
      req.body;

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        title,
        description,
        code,
        type: type as CouponType,
        value: parseFloat(value),
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.coupon.delete({ where: { id } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
