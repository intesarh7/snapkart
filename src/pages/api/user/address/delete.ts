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
    // ✅ Auth Check
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Address ID required" });
    }

    // ✅ Check address belongs to logged in user
    const address = await prisma.address.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // ❌ Optional Safety: Default address delete na hone do
    if (address.isDefault) {
      return res.status(400).json({
        message: "Default address cannot be deleted. Set another default first.",
      });
    }

    // ✅ Delete
    await prisma.address.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Address deleted" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
