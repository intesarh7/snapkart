import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req: NextApiRequest): Promise<string> {
  const buffers: Uint8Array[] = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  return Buffer.concat(buffers).toString("utf8")
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const rawBody = await getRawBody(req)

    const signature = req.headers["x-webhook-signature"] as string

    // 🔐 Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
      .update(rawBody)
      .digest("base64")

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid signature" })
    }

    const event = JSON.parse(rawBody)

    const { order_id, order_status } = event.data

    // order_id format: SNAP_12
    const paymentId = Number(order_id.replace("SNAP_", ""));

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // 🔒 Prevent duplicate processing
    if (payment.status === "PAID") {
      return res.status(200).json({ message: "Already processed" })
    }

    /* =============================
       PAYMENT SUCCESS
    ============================= */

    if (order_status === "PAID") {

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        }
      })

      /* ========= ORDER PAYMENT ========= */

      if (payment.referenceType === "ORDER") {
        await prisma.order.update({
          where: { id: payment.referenceId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            paidAt: new Date(),
          }
        })
      }

      /* ========= TABLE BOOKING PAYMENT ========= */

      if (payment.referenceType === "BOOKING") {
        await prisma.tableBooking.update({
          where: { id: payment.referenceId },
          data: {
            status: "CONFIRMED",
            isAdvancePaid: true,
            updatedAt: new Date(),
          }
        })

        // 🔔 Create notification for admin
        await prisma.bookingNotification.create({
          data: {
            bookingId: payment.referenceId,
          }
        })
      }
    }

    /* =============================
       PAYMENT FAILED
    ============================= */

    if (order_status === "FAILED") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
        }
      })
    }

    return res.status(200).json({ received: true })

  } catch (err: any) {
    console.error("Webhook error:", err)
    return res.status(500).json({ message: err.message })
  }
}
