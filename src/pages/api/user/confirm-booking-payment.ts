import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Get latest pending booking of this user
    const booking = await prisma.tableBooking.findFirst({
      where: {
        userId: user.id,
        status: "AWAITING_PAYMENT",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!booking) {
      return res.status(400).json({ message: "No pending booking found" });
    }

    await prisma.tableBooking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        isAdvancePaid: true,
      },
    });

    return res.status(200).json({ message: "Booking confirmed" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
