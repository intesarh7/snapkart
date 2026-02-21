import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import cloudinary from "@/lib/cloudinary";

/* -------- Helper: Extract Cloudinary Public ID -------- */

function extractPublicId(url: string) {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    return publicIdWithExt.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

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

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { image: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* -------- Delete from Cloudinary (if exists) -------- */

    if (existing.image) {
      const publicId = extractPublicId(existing.image);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }
    }

    /* -------- DB Transaction -------- */

    await prisma.$transaction(async (tx) => {

      // 🔥 Delete related order items
      await tx.orderItem.deleteMany({
        where: { productId }
      });

      // 🔥 Delete related variants
      await tx.productVariant.deleteMany({
        where: { productId }
      });

      // 🔥 Delete related extras
      await tx.productExtra.deleteMany({
        where: { productId }
      });

      // 🔥 Delete product
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