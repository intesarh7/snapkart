import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = req.cookies.snapkart_token;

    if (!token) {
      return res.status(401).json({ hasAddress: false });
    }

    const decoded = verifyToken(token);

    // ✅ Type Guard Fix
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ hasAddress: false });
    }

    const address = await prisma.address.findFirst({
      where: { userId: decoded.id },
    });

    return res.status(200).json({
      hasAddress: !!address,
    });

  } catch (error) {
    return res.status(401).json({ hasAddress: false });
  }
}