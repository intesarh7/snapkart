import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const products = await prisma.product.findMany({
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            deliveryTime: true,
          },
        },
        variants: true,
        extras: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
