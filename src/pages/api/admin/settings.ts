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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    /* ===============================
                GET SETTINGS
    ================================= */

    if (req.method === "GET") {
      const settings = await prisma.websiteSetting.findFirst();
      return res.status(200).json(settings);
    }

    /* ===============================
                UPDATE SETTINGS
    ================================= */

    if (req.method === "PUT") {

      const {
        contactNumber,
        email,
        address,
        facebook,
        instagram,
        twitter,
        youtube,
        footerInfo,
        headerLogo,
        footerLogo,
      } = req.body;

      const existing = await prisma.websiteSetting.findFirst();

      const data: any = {
        contactNumber,
        email,
        address,
        facebook,
        instagram,
        twitter,
        youtube,
        footerInfo,
      };

      /* ===============================
            HEADER LOGO UPLOAD
      ================================= */

      if (headerLogo && headerLogo.startsWith("data:image/")) {

        if (existing?.headerLogo) {
          try {
            const publicId = existing.headerLogo
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];

            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Old header logo delete error:", err);
          }
        }

        const uploadResponse = await cloudinary.uploader.upload(
          headerLogo,
          {
            folder: "snapkart/settings",
            transformation: [
              { width: 300, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          }
        );

        data.headerLogo = uploadResponse.secure_url;
      }

      /* ===============================
            FOOTER LOGO UPLOAD
      ================================= */

      if (footerLogo && footerLogo.startsWith("data:image/")) {

        if (existing?.footerLogo) {
          try {
            const publicId = existing.footerLogo
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];

            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Old footer logo delete error:", err);
          }
        }

        const uploadResponse = await cloudinary.uploader.upload(
          footerLogo,
          {
            folder: "snapkart/settings",
            transformation: [
              { width: 300, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          }
        );

        data.footerLogo = uploadResponse.secure_url;
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
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error: any) {
    console.error("SETTINGS ERROR:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
}