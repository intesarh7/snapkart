import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    const productId = Number(id);

    await prisma.$transaction(async (tx) => {

      // 🔥 Delete related order items first
      await tx.orderItem.deleteMany({
        where: { productId }
      });

      // 🔥 Then delete product
      await tx.product.delete({
        where: { id: productId }
      });

    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
