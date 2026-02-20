import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const notifications = await prisma.bookingNotification.findMany({
    where: { isRead: false },
    include: {
      booking: true,
    },
  });

  res.status(200).json(notifications);
}
