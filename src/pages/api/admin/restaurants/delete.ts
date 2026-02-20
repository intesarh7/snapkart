import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE")
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

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "Restaurant ID required",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(id) },
      include: {
        categories: true,
        products: true,
        orders: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    // 🔒 Safety: Prevent delete if orders exist
    if (restaurant.orders.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete restaurant with existing orders",
      });
    }

    // 🗑 Delete image if exists
    if (restaurant.image) {
      const filePath = path.join(
        process.cwd(),
        "public",
        restaurant.image
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 🔥 Delete restaurant (relations auto handle if cascade enabled)
    await prisma.restaurant.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
