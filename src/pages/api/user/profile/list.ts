import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return res.status(401).json({ message: "Unauthorized" });

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ addresses });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
