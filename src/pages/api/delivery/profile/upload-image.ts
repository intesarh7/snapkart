import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { verifyRole } from "@/lib/auth";
import multer from "multer"
import path from "path"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false
  }
}

// 🔥 Storage config
const uploadDir = path.join(process.cwd(), "public/uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s/g, "")
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {


   // 🔐 DELIVERY GUARD
  const delivery = await verifyRole(req, res, ["DELIVERY"]);
  if (!delivery) return;

    await runMiddleware(req, res, upload.single("image"))

    const file = (req as any).file

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imagePath = `/uploads/${file.filename}`

    await prisma.user.update({
      where: { id: delivery.id },
      data: { image: imagePath }
    })

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      image: imagePath
    })

  } catch (error) {
    console.error("Upload Error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
