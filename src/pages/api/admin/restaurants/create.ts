import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyAdmin } from "@/lib/adminAuth";

interface MulterRequest extends NextApiRequest {
  file?: Express.Multer.File;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

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
      return resolve(result);
    });
  });
}

export default async function handler(
  req: MulterRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, upload.single("image"));

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  // 🔐 ADMIN AUTH CHECK
  const admin = verifyAdmin(req, res);
  if (!admin) return;

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

    const {
      name,
      address,
      city,
      latitude,
      longitude,
      isActive,
      isOpen,

      // 🔥 NEW FIELDS
      openTime,
      closeTime,
      rating,
      deliveryTime,
      addOffer,
    } = req.body;

    const parsedDeliveryTime = Array.isArray(deliveryTime)
      ? deliveryTime[0]
      : deliveryTime;

      const parsedRating = Array.isArray(rating)
      ? rating[0]
      : rating;


    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        address,
        city: city || "Unknown",
        latitude: Number(latitude),
        longitude: Number(longitude),
        isActive: isActive === "true",
        isOpen: isOpen === "true",
        image: imagePath,

        // 🔥 NEW FIELDS SAVED
        openTime: openTime || null,
        closeTime: closeTime || null,
       deliveryTime:
        typeof parsedDeliveryTime === "string"
          ? parsedDeliveryTime.trim()
          : null,

      rating:
        parsedRating &&
        parsedRating.toString().trim() !== ""
          ? Number(parsedRating)
          : 0,
        addOffer: addOffer || null,
      },
    });

    return res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
