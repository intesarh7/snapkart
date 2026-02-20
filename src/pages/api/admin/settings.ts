import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure upload folder exists
const uploadPath = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer setup
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

// Helper to run multer
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const settings = await prisma.websiteSetting.findFirst();

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }


  if (req.method === "PUT") {
    try {
      await runMiddleware(
        req,
        res,
        upload.fields([
          { name: "headerLogo", maxCount: 1 },
          { name: "footerLogo", maxCount: 1 },
        ])
      );

      const existing = await prisma.websiteSetting.findFirst();

      const data: any = {
        contactNumber: req.body.contactNumber,
        email: req.body.email,
        address: req.body.address,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
        twitter: req.body.twitter,
        youtube: req.body.youtube,
        footerInfo: req.body.footerInfo,
      };

      const files = (req as any).files;

      if (files?.headerLogo) {
        data.headerLogo = "/uploads/" + files.headerLogo[0].filename;
      }

      if (files?.footerLogo) {
        data.footerLogo = "/uploads/" + files.footerLogo[0].filename;
      }

      let result;

      if (existing) {
        result = await prisma.websiteSetting.update({
          where: { id: existing.id },
          data,
        });
      } else {
        result = await prisma.websiteSetting.create({
          data,
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
