import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: {
        name: true,
        image: true,
      },
    });

    // remove duplicates manually
    const uniqueCategories = [
      ...new Map(
        categories.map((c) => [c.name.toLowerCase(), c])
      ).values(),
    ];

    return res.status(200).json({
      success: true,
      categories: uniqueCategories,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
