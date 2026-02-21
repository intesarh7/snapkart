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
        message: "Offer ID required",
      });
    }

    const offer = await prisma.specialOffer.findUnique({
      where: { id: Number(id) },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    /* -------- Cloudinary Delete -------- */

    if (offer.image) {
      try {
        const publicId = offer.image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await prisma.specialOffer.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });

  } catch (error: any) {
    console.error("SPECIAL OFFER DELETE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}