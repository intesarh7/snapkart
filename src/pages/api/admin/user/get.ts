import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

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

    /* ===============================
       📋 FETCH USERS
    ================================= */
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Fetch Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}