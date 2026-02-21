import type { NextApiRequest, NextApiResponse } from "next"
import cloudinary from "@/lib/cloudinary"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { image, folder } = req.body

    if (!image) {
      return res.status(400).json({ message: "Image is required" })
    }

    // 🔍 Basic base64 validation
    if (!image.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" })
    }

    // 📦 Extract mime type
    const mimeType = image.split(";")[0].split(":")[1]

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({
        message: "Only JPG, PNG, WEBP images are allowed",
      })
    }

    // ☁️ Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: folder ? `snapkart/${folder}` : "snapkart",
      resource_type: "image",

      // 🔥 Optimization
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    })

    return res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    })

  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error?.response?.data || error)

    return res.status(500).json({
      message: "Image upload failed",
    })
  }
}