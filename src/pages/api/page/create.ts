import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const admin = verifyAdmin(req, res);
  if (!admin) return;

  const { slug, title, content, metaTitle, metaDescription } = req.body;

  if (!slug || !title || !content) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  try {
    const existing = await prisma.page.findUnique({
      where: { slug },
    });

    if (existing) {
      await prisma.page.update({
        where: { slug },
        data: {
          slug,
          title,
          content,
          metaTitle,
          metaDescription,
        }
      });
    } else {
      await prisma.page.create({
        data: { slug, title, content },
      });
    }

    return res.json({
      success: true,
      message: "Page saved successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
