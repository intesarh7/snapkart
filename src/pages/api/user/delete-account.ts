import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = await verifyUser(req);

    if (!auth.success) {
      return res.status(auth.status).json({ message: auth.message });
    }

    const user = auth.user;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Clear cookie
    res.setHeader(
      "Set-Cookie",
      "snapkart_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}