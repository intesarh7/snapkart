import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { upload } from "@/lib/multer";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  upload.single("image")(req as any, res as any, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: "Upload failed" });
    }

    try {
      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = `/uploads/profile/${file.filename}`;
      /* ===== Delete Old Image If Exists ===== */
      if (user.image) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          user.image
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      /* ===== Save New Image URL in DB ===== */
      await prisma.user.update({
        where: { id: user.id },
        data: {
          image: imageUrl,
        },
      });

      return res.status(200).json({
        message: "Profile image updated",
        image: imageUrl,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });
}
