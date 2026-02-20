import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Address ID required" });
    }

    // Reset all addresses default false
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // Set selected address as default
    await prisma.address.update({
      where: { id: Number(id) },
      data: { isDefault: true },
    });

    return res.status(200).json({ message: "Default updated" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
