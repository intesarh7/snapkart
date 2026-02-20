import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
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

/* ---------------- MULTER SETUP ---------------- */

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });
}

export default async function handler(req: any, res: NextApiResponse) {
  await runMiddleware(req, res, upload.single("image"));

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

    // If new image uploaded
    if (req.file) {
      // delete old image
      if (existing.image) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          existing.image
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      imagePath = `/uploads/${req.file.filename}`;
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

    /* -------- FINAL PRICE CALCULATION -------- */

    const finalPrice = calculateFinalPrice(
      basePrice,
      offerType,
      offerValue ? Number(offerValue) : undefined,
      extraType,
      extraValue ? Number(extraValue) : undefined
    );

    const variants = req.body.variants
      ? JSON.parse(req.body.variants)
      : [];

    const extras = req.body.extras
      ? JSON.parse(req.body.extras)
      : [];
      
    /* -------- DATABASE UPDATE -------- */

    await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        category,
        isAvailable: available === "true" || available === "Yes",
        isActive: active === "true" || active === "Yes",
        price: Number(price),
        offerType: offerType || null,
        offerValue: offerValue ? Number(offerValue) : null,
        extraType: extraType || null,
        extraValue: extraValue ? Number(extraValue) : null,
        finalPrice,
        rating: rating ? Number(rating) : 0,
        image: imagePath,
      },
    });

    await prisma.productVariant.deleteMany({
      where: { productId: Number(id) },
    });

    await prisma.productExtra.deleteMany({
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
    return res.status(500).json({
      message: error.message,
    });
  }
}


