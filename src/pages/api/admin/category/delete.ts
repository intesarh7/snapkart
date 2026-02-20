import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 🔐 ADMIN AUTH CHECK
  const admin = verifyAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID required",
    });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 🔒 Optional Safety: Prevent delete if products exist
    if (category.products.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with existing products",
      });
    }

    // 🗑️ Delete Image File If Exists
    if (category.image) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        category.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 🗑️ Delete Category From DB
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
