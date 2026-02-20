import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.body;

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address)
      return res.status(404).json({ message: "Address not found" });

    const total = await prisma.address.count({
      where: { userId: user.id },
    });

    if (total <= 1)
      return res.status(400).json({
        message: "Cannot delete last address",
      });

    await prisma.address.delete({ where: { id } });

    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
