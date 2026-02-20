import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

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
  req: any,
  res: NextApiResponse
) {
  await runMiddleware(req, res, upload.single("image"));

  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });

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

    const { id } = req.query;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(id) },
    });

    if (!restaurant)
      return res.status(404).json({ message: "Not found" });

    let imagePath = restaurant.image;

    if (req.file) {
      // delete old image
      if (restaurant.image) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          restaurant.image
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      imagePath = `/uploads/${req.file.filename}`;
    }

    // 🔥 IMPORTANT: Destructure ALL fields
    const {
      name,
      address,
      latitude,
      longitude,
      isActive,
      isOpen,
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

    await prisma.restaurant.update({
      
      where: { id: Number(id) },
      data: {
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        isActive: isActive === "true",
        isOpen: isOpen === "true",
        image: imagePath,

        // 🔥 NEW FIELDS SAVED PROPERLY
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
   

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
