import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const token = req.cookies.snapkart_token;

    if (!token)
      return res.status(401).json({ message: "Unauthorized" });

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (decoded.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    const restaurants = await prisma.restaurant.findMany({
      
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        latitude: true,
        longitude: true,
        image: true,

        openTime: true,
        closeTime: true,
        rating: true,
        deliveryTime: true,
        addOffer: true,

        isActive: true,
        isOpen: true,

        createdAt: true,
        updatedAt: true,

        // 👇 categories moved inside select
        categories: true,
      },
    });
    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
