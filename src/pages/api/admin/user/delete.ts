import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  // 🔐 Admin Auth
const admin = await verifyRole(req, res, ["ADMIN"]);
  if (!admin) return;


  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting self
    if (Number(id) === admin.id) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot delete your own account",
      });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
