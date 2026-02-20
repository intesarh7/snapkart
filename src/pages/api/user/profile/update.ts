import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, phone },
    });

    return res.status(200).json({
      message: "Profile updated",
      user: updated,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
