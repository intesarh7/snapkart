import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code required" });
    }

    if (cartTotal === undefined || cartTotal === null) {
      return res.status(400).json({ message: "Cart total required" });
    }

    const numericCartTotal = Number(cartTotal);

    const token = req.cookies?.snapkart_token;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded: any = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = Number(decoded.id);

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code) }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    /* -------- TOTAL USAGE LIMIT CHECK -------- */

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    /* -------- ONE TIME PER USER CHECK -------- */

    if (coupon.oneTimePerUser) {
      const existingUsage = await prisma.couponUsage.findUnique({
        where: {
          couponId_userId: {
            couponId: coupon.id,
            userId: userId
          }
        }
      });

      if (existingUsage) {
        return res.status(400).json({
          message: "You already used this coupon"
        });
      }
    }

    /* -------- CALCULATE DISCOUNT -------- */

    let discount = 0;

    if (coupon.type === "PERCENTAGE") {
      discount = (numericCartTotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    /* -------- SAVE USAGE -------- */

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        usedCount: { increment: 1 }
      }
    });

    await prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        userId: userId
      }
    });

    return res.status(200).json({
      success: true,
      discount
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
