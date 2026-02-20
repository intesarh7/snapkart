import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email required",
    });
  }

  try {
    await prisma.newsletter.create({
      data: { email },
    });

    return res.json({
      success: true,
      message: "Subscribed Successfully",
    });
  } catch {
    return res.json({
      success: false,
      message: "Already Subscribed",
    });
  }
}
