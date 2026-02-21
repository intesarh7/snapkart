import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdmin } from "@/lib/adminAuth";
import cloudinary from "@/lib/cloudinary";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ message: "Method not allowed" });

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Featured ID required",
      });
    }

    const item = await prisma.featured.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Featured item not found",
      });
    }

    /* ===============================
            ☁️ CLOUDINARY CLEANUP
    ================================= */

    if (item.image) {
      try {
        const publicId = item.image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await prisma.featured.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Featured item deleted successfully",
    });

  } catch (error: any) {
    console.error("FEATURED DELETE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}