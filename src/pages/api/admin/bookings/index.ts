import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bookings = await prisma.tableBooking.findMany({
  include: {
    restaurant: true,
    user: true,
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
}
