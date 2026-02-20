import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 🔐 Get logged in user (Pages Router Safe)
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔄 Always fetch fresh user from DB
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        role: true,
        isAvailable: true,
        isActive: true,
      },
    });

    if (!freshUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: freshUser });

  } catch (error) {
    console.error("Auth Me Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}