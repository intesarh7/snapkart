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

  if (req.method === "GET") {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json(coupons);
  }

  if (req.method === "POST") {
    const { title, description, code, type, value, expiresAt } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        title,
        description,
        code,
        type: type as CouponType,
        value: parseFloat(value),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return res.status(201).json(coupon);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
