import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await verifyAdmin(req);

  if (!auth.success) {
    return res.status(auth.status).json({ message: auth.message });
  }

  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: true },
      orderBy: { deletedAt: "desc" },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}