import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { code, userId, cartTotal } = req.body;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon limit reached" });
    }

    let discount = 0;

    if (coupon.type === "PERCENTAGE") {
      discount = (cartTotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    return res.status(200).json({
      discount,
      coupon,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
