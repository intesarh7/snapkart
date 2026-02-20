import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return res.status(401).json({ message: "Unauthorized" });

    const {
      restaurantId,
      tableId,
      bookingDate,
      bookingTime,
      guests,
      location,
      specialNote,
      preOrderedProducts,
    } = req.body;

    if (!restaurantId || !bookingDate || !bookingTime || !guests) {
      return res.status(400).json({ message: "Missing fields" });
    }

    /* ================= GET BOOKING SETTING ================= */

    const bookingSetting =
      await prisma.restaurantBookingSetting.findUnique({
        where: { restaurantId: Number(restaurantId) },
      });

    let advanceAmount: number | null = null;

    if (
      bookingSetting?.isBookingEnabled &&
      bookingSetting?.advanceRequired
    ) {
      if (bookingSetting.advanceType === "PERCENTAGE") {
        advanceAmount =
          (bookingSetting.advanceValue || 0) * guests;
      } else {
        advanceAmount = bookingSetting.advanceValue || 0;
      }
    }

    /* ================= CREATE BOOKING ================= */

    const booking = await prisma.tableBooking.create({
      data: {
        restaurantId: Number(restaurantId),
        tableId: tableId ? Number(tableId) : null,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        bookingTime,
        guests: Number(guests),
        location,
        specialNote,
        status: "PENDING",
        advanceAmount,
        isAdvancePaid: false,
        preOrderedProducts: {
          create: preOrderedProducts.map((item: any) => ({
            productId: item.productId ?? item,
            quantity: item.quantity ?? 1,
          })),
        },
      },
      include: {
        restaurant: true,
        preOrderedProducts: true,
      },
    });
    await prisma.bookingNotification.create({
        data: {
            bookingId: booking.id,
        },
    });

    return res.status(200).json(booking);
  } catch (error) {
    console.error("Booking create error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
