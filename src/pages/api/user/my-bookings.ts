import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return res.status(401).json({ message: "Unauthorized" });

    const bookings = await prisma.tableBooking.findMany({
      where: { userId: user.id },
      include: {
        restaurant: true,
        preOrderedProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
