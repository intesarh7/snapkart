import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { restaurantId, cartTotal } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ deliveryCharge: 0 });
    }

    const rule = await prisma.deliveryRule.findFirst({
      where: {
        restaurantId: Number(restaurantId),
        isActive: true,
        minOrder: { lte: cartTotal }
      },
      orderBy: { minOrder: "desc" }
    });

    if (!rule) {
      return res.status(200).json({ deliveryCharge: 0 });
    }

    let charge = 0;

    if (rule.chargeType === "FREE") {
      charge = 0;
    } else {
      charge = rule.chargeAmount;
    }

    return res.status(200).json({ deliveryCharge: charge });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ deliveryCharge: 0 });
  }
}
