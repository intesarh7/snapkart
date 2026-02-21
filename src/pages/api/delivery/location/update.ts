import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyDelivery } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    /* ===============================
       🔐 VERIFY DELIVERY
    ================================= */
    const auth = await verifyDelivery(req);

    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    const deliveryUser = auth.user;

    if (!deliveryUser.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "You are offline. Cannot update location.",
      });
    }

    /* ===============================
       📍 VALIDATE LOCATION DATA
    ================================= */
    const { latitude, longitude } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    /* ===============================
       💾 UPDATE LOCATION
    ================================= */
    await prisma.user.update({
      where: { id: deliveryUser.id },
      data: {
        latitude: lat,
        longitude: lng,
        lastLocationUpdate: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
    });

  } catch (error) {
    console.error("Location Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}