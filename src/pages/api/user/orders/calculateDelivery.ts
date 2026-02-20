import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { calculateDistanceInKm } from "@/lib/calculateDistance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { restaurantId, cartTotal, userLat, userLng } = req.body;

    if (!restaurantId || !cartTotal || !userLat || !userLng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurantId) },
    });

    if (!restaurant || !restaurant.isActive || !restaurant.isOpen) {
      return res.status(400).json({ message: "Restaurant unavailable" });
    }

    const distance = calculateDistanceInKm(
      Number(userLat),
      Number(userLng),
      restaurant.latitude,
      restaurant.longitude
    );

    const rules = await prisma.deliveryRule.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      orderBy: {
        minDistance: "asc",
      },
    });

    let deliveryCharge = 0;

    const matchedRule = rules.find((rule) => {
      const orderMatch =
        cartTotal >= rule.minOrder &&
        (!rule.maxOrder || cartTotal <= rule.maxOrder);

      const distanceMatch =
        distance >= rule.minDistance &&
        (!rule.maxDistance || distance <= rule.maxDistance);

      return orderMatch && distanceMatch;
    });

    if (matchedRule) {
      deliveryCharge =
        matchedRule.chargeType === "FREE"
          ? 0
          : matchedRule.chargeAmount;
    }

    return res.status(200).json({
      distance: Number(distance.toFixed(2)),
      deliveryCharge,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
