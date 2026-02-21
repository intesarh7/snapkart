import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

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

  try {
    /* ===============================
       🔐 VERIFY ADMIN
    ================================= */
    const auth = await verifyAdmin(req);

    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    const admin = auth.user;

    /* ===============================
       🆔 GET USER ID
    ================================= */
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid User ID required",
      });
    }

    const userId = Number(id);

    /* ===============================
       🔎 CHECK USER EXISTS
    ================================= */
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ===============================
       🚫 PREVENT SELF DELETE
    ================================= */
    if (userId === admin.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    /* ===============================
       🗑 DELETE USER
    ================================= */
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error: any) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}