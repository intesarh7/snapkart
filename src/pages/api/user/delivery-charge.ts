import { calculateDistanceInKm } from "@/lib/calculateDistance";
import { calculateDeliveryCharge } from "@/lib/deliveryRule";
import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { restaurantId, userLat, userLng, cartTotal } = req.body;

    if (!restaurantId || !userLat || !userLng) {
      return res.status(400).json({ message: "Missing data" });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurantId) },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const distance = calculateDistanceInKm(
      userLat,
      userLng,
      restaurant.latitude,
      restaurant.longitude
    );

    const deliveryCharge = await calculateDeliveryCharge(
      Number(restaurantId),
      Number(cartTotal || 0),
      distance
    );

    console.log("------ DELIVERY API ------");
    console.log("Distance:", distance);
    console.log("Cart:", cartTotal);
    console.log("Delivery Charge:", deliveryCharge);

    return res.status(200).json({
      distance,
      deliveryCharge,
    });

  } catch (error) {
    console.error("Delivery API Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
