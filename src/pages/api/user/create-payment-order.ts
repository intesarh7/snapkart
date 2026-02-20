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
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { type, referenceId, amount } = req.body;

    if (!type || !referenceId || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    /* ================= VALIDATION ================= */

    if (type === "BOOKING") {
      const booking = await prisma.tableBooking.findUnique({
        where: { id: Number(referenceId) },
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.status !== "AWAITING_PAYMENT") {
        return res.status(400).json({ message: "Invalid booking status" });
      }
    }

    /* ================= CREATE PAYMENT ENTRY FIRST ================= */

    const payment = await prisma.payment.create({
      data: {
        referenceType: type,
        referenceId: Number(referenceId),
        bookingId: type === "BOOKING" ? Number(referenceId) : null,
        userId: user.id,
        amount: Number(amount),
        status: "PENDING",
      },
    });

    const gatewayOrderId = `SNAP_${payment.id}`;

    /* ================= CREATE CASHFREE ORDER ================= */

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://snapkart-mu.vercel.app/";

    const cashfreeRes = await fetch(
      process.env.CASHFREE_ENV === "PROD"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
          "x-api-version": "2022-09-01",
        },
        body: JSON.stringify({
          order_id: gatewayOrderId,
          order_amount: Number(amount),
          order_currency: "INR",
          customer_details: {
            customer_id: String(user.id),
            customer_email: user.email,
            customer_phone: user.phone || "9999999999",
          },
          order_meta: {
            return_url: `${baseUrl}/user/payment-success`,
          },
        }),
      }
    );

    const cashfreeData = await cashfreeRes.json();

    if (!cashfreeRes.ok) {
      console.error("Cashfree Error:", cashfreeData);
      return res.status(400).json({
        message: "Cashfree order failed",
      });
    }

    const paymentLink = cashfreeData?.payments?.url;

if (!paymentLink) {
  console.error("Cashfree response:", cashfreeData);
  return res.status(400).json({
    message: "Payment link not received",
  });
}

    /* ================= SAVE GATEWAY ORDER ID ================= */

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayOrderId,
      },
    });

    return res.status(200).json({
  paymentSessionId: cashfreeData.payment_session_id,
  paymentId: payment.id,
});

  } catch (error) {
    console.error("Payment create error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
