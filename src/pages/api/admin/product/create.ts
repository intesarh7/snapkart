import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

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

export default async function handler(req: any, res: NextApiResponse) {


  const admin = verifyAdmin(req, res);
  if (!admin) return;

  try {

    // 🔥 HANDLE UPDATE
    if (req.method === "PUT") {

      const id = Number(req.query.id);
      if (!id) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const existing = await prisma.product.findUnique({
        where: { id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const {
        name,
        description,
        category,
        categoryId,
        available,
        active,
        price,
        offerType,
        offerValue,
        extraType,
        extraValue,
        rating,
        restaurantId,
      } = req.body;

      const basePrice = Number(price);

      const finalPrice = calculateFinalPrice(
        basePrice,
        offerType,
        offerValue ? Number(offerValue) : undefined,
        extraType,
        extraValue ? Number(extraValue) : undefined
      );

      let imagePath = existing.image;

      if (req.body.image && req.body.image.startsWith("data:image/")) {

        // delete old image from cloudinary
        if (existing.image) {
          const parts = existing.image.split("/");
          const uploadIndex = parts.findIndex(p => p === "upload");
          const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

          await cloudinary.uploader.destroy(publicId);
        }

        const uploadResponse = await cloudinary.uploader.upload(req.body.image, {
          folder: "snapkart/products",
          resource_type: "image",
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        });

        imagePath = uploadResponse.secure_url;
      }

      return res.status(200).json({
        success: true,
        message: "Product updated"
      });
    }

    // 🔥 HANDLE CREATE
    if (req.method === "POST") {

      const {
        name,
        description,
        category,
        categoryId,
        available,
        active,
        price,
        offerType,
        offerValue,
        extraType,
        extraValue,
        rating,
        restaurantId,
      } = req.body;

      const basePrice = Number(price);

      const finalPrice = calculateFinalPrice(
        basePrice,
        offerType,
        offerValue ? Number(offerValue) : undefined,
        extraType,
        extraValue ? Number(extraValue) : undefined
      );

      let imagePath = null;

      if (req.body.image && req.body.image.startsWith("data:image/")) {

        const uploadResponse = await cloudinary.uploader.upload(req.body.image, {
          folder: "snapkart/products",
          resource_type: "image",
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        });

        imagePath = uploadResponse.secure_url;
      }
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

      await prisma.product.create({
        data: {
          name,
          description,
          category,
          categoryId: Number(categoryId),
          isAvailable: available === "true" || available === "Yes",
          isActive: active === "true" || active === "Yes",
          price: basePrice,
          offerType: offerType || null,
          offerValue: offerValue ? Number(offerValue) : null,
          extraType: extraType || null,
          extraValue: extraValue ? Number(extraValue) : null,
          finalPrice,
          rating: rating ? Number(rating) : 0,
          restaurantId: Number(restaurantId),
          image: imagePath,
          variants: {
            create: variants.map((v: any) => ({
              name: v.name,
              price: Number(v.price),
              finalPrice: Number(v.price),
            })),
          },
          extras: {
            create: extras.map((e: any) => ({
              name: e.name,
              price: Number(e.price),
            })),
          },
        }
      });

      return res.status(201).json({
        success: true,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err: any) {
    console.error("PRODUCT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
