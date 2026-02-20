import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const {
        restaurantId,
        isBookingEnabled,
        advanceRequired,
        advanceType,
        advanceValue,
      } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId required" });
      }

      const setting = await prisma.restaurantBookingSetting.upsert({
        where: {
          restaurantId: Number(restaurantId),
        },
        update: {
          isBookingEnabled: Boolean(isBookingEnabled),
          advanceRequired: Boolean(advanceRequired),
          advanceType: advanceRequired ? advanceType : null,
          advanceValue: advanceRequired
            ? Number(advanceValue)
            : null,
        },
        create: {
          restaurantId: Number(restaurantId),
          isBookingEnabled: Boolean(isBookingEnabled),
          advanceRequired: Boolean(advanceRequired),
          advanceType: advanceRequired ? advanceType : null,
          advanceValue: advanceRequired
            ? Number(advanceValue)
            : null,
        },
      });

      return res.status(200).json(setting);
    }

    if (req.method === "GET") {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(200).json(null); // <-- IMPORTANT FIX
      }

      const setting = await prisma.restaurantBookingSetting.findUnique({
        where: {
          restaurantId: Number(restaurantId),
        },
      });
      

      return res.status(200).json(setting || null);
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("Booking setting error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
