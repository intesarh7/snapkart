import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const auth = await verifyAdmin(req);

  if (!auth.success) {
    return res.status(auth.status).json({ message: auth.message });
  }

  const { userId } = req.body;

  try {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User restored successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Restore failed" });
  }
}