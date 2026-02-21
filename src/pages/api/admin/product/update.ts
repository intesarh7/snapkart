import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

/* ---------------- FINAL PRICE CALCULATION ---------------- */

const calculateFinalPrice = (
  price: number,
  offerType?: string,
  offerValue?: number,
  extraType?: string,
  extraValue?: number
) => {
  let base = price;

  if (offerType === "percentage") {
    base -= (base * (offerValue || 0)) / 100;
  }

  if (offerType === "flat") {
    base -= offerValue || 0;
  }

  if (extraType === "percentage") {
    base -= (base * (extraValue || 0)) / 100;
  }

  if (extraType === "flat") {
    base -= extraValue || 0;
  }

  return base > 0 ? Number(base.toFixed(2)) : 0;
};

/* ---------------- HANDLER ---------------- */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { id } = req.query;

    if (!id)
      return res.status(400).json({ message: "ID required" });

    const existing = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    let imagePath = existing.image;

    /* -------- IMAGE UPDATE (Cloudinary) -------- */

    if (req.body.image && req.body.image.startsWith("data:image/")) {

      // Delete old image from Cloudinary
      if (existing.image) {
        try {
          const parts = existing.image.split("/");
          const uploadIndex = parts.findIndex(p => p === "upload");
          const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }

      const uploadResponse = await cloudinary.uploader.upload(
        req.body.image,
        {
          folder: "snapkart/products",
          resource_type: "image",
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        }
      );

      imagePath = uploadResponse.secure_url;
    }

    const {
      name,
      description,
      category,
      available,
      active,
      price,
      offerType,
      offerValue,
      extraType,
      extraValue,
      rating,
    } = req.body;

    const basePrice = Number(price);

    const finalPrice = calculateFinalPrice(
      basePrice,
      offerType,
      offerValue ? Number(offerValue) : undefined,
      extraType,
      extraValue ? Number(extraValue) : undefined
    );

    const variants = req.body.variants
      ? typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants
      : [];

    const extras = req.body.extras
      ? typeof req.body.extras === "string"
        ? JSON.parse(req.body.extras)
        : req.body.extras
      : [];

    /* -------- DATABASE UPDATE -------- */

    await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        category,
        isAvailable: available === true || available === "true" || available === "Yes",
        isActive: active === true || active === "true" || active === "Yes",
        price: basePrice,
        offerType: offerType || null,
        offerValue: offerValue ? Number(offerValue) : null,
        extraType: extraType || null,
        extraValue: extraValue ? Number(extraValue) : null,
        finalPrice,
        rating: rating ? Number(rating) : 0,
        image: imagePath,
      },
    });

    /* -------- RESET VARIANTS -------- */

    await prisma.productVariant.deleteMany({
      where: { productId: Number(id) },
    });

    if (variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          name: v.name,
          price: Number(v.price),
          finalPrice: Number(v.price),
          productId: Number(id),
        })),
      });
    }

    /* -------- RESET EXTRAS -------- */

    await prisma.productExtra.deleteMany({
      where: { productId: Number(id) },
    });

    if (extras.length > 0) {
      await prisma.productExtra.createMany({
        data: extras.map((e: any) => ({
          name: e.name,
          price: Number(e.price),
          productId: Number(id),
        })),
      });
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("PRODUCT UPDATE ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
}