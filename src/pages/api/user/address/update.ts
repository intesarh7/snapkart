import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      id,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    // 🔥 Validate location if provided
    let parsedLat: number | undefined = undefined;
    let parsedLng: number | undefined = undefined;

    if (latitude !== undefined && longitude !== undefined) {
      parsedLat = parseFloat(latitude);
      parsedLng = parseFloat(longitude);

      if (
        isNaN(parsedLat) ||
        isNaN(parsedLng) ||
        parsedLat === 0 ||
        parsedLng === 0
      ) {
        return res.status(400).json({
          message:
            "Invalid location detected. Please use Detect My Location.",
        });
      }
    }

    // 🔥 Ensure address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    // 🔥 If setting as default → remove other defaults
    if (isDefault === true) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    await prisma.address.update({
      where: {
        id: Number(id),
      },
      data: {
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
        ...(parsedLat !== undefined && { latitude: parsedLat }),
        ...(parsedLng !== undefined && { longitude: parsedLng }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("Address Update Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
