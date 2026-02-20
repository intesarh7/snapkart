import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields including location are required. Please detect your location."
      });
    }

    const existingCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    if (
      isNaN(parsedLat) ||
      isNaN(parsedLng) ||
      parsedLat === 0 ||
      parsedLng === 0
    ) {
      return res.status(400).json({
        message: "Invalid location detected. Please use Detect My Location."
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
        latitude: parsedLat,
        longitude: parsedLng,
        isDefault: existingCount === 0,
      },
    });

    return res.status(200).json({ address: newAddress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
