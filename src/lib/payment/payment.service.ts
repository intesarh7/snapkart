import { prisma } from "@/lib/prisma"
import { CreatePaymentPayload } from "./payment.types"
import { cashfreeApi } from "@/lib/payment/cashfree"


export async function createPaymentSession(payload: CreatePaymentPayload) {

  
  
  const { userId, referenceType, referenceId } = payload

  // 🔒 Always fetch amount from DB
  let amount = 0

if (referenceType === "ORDER") {
  const order = await prisma.order.findUnique({
    where: { id: referenceId }
  })
  if (!order) throw new Error("Order not found")

  amount = order.finalAmount
}

if (!amount || amount <= 0) {
  throw new Error("Invalid payment amount")
}

// 🔥 Fetch User Details for Cashfree
const dbUser = await prisma.user.findUnique({
  where: { id: userId }
})

if (!dbUser) {
  throw new Error("User not found")
}

// Ensure phone is valid 10 digit numeric
const formattedPhone = dbUser.phone
  ? dbUser.phone.toString().replace(/\D/g, "").slice(-10)
  : "9999999999"

const formattedEmail = dbUser.email || "noemail@snapkart.com"

  if (referenceType === "BOOKING") {
    const booking: any = await prisma.$queryRawUnsafe(
      `SELECT bookingAmount FROM Booking WHERE id = ?`,
      referenceId
    )
    if (!booking) throw new Error("Booking not found")
    amount = booking.bookingAmount
  }

  // 1️⃣ Create Payment Record (PENDING)
  const payment = await prisma.payment.create({
    data: {
      userId,
      referenceType,
      referenceId,
      orderId: referenceType === "ORDER" ? referenceId : null,
      amount,
      status: "PENDING",
    }
  })

  // 2️⃣ Create Cashfree Order
 const cfOrder = await cashfreeApi.post("/orders", {
  order_amount: amount,
  order_currency: "INR",
  order_id: `SNAP_${payment.id}_${Math.floor(Math.random()*10000)}`,
  order_note: `SnapKart Payment ${payment.id}`,
  customer_details: {
  customer_id: userId.toString(),
  customer_email: formattedEmail,
  customer_phone: formattedPhone
}
})

  // 3️⃣ Update Payment with gateway data
 await prisma.payment.update({
  where: { id: payment.id },
  data: {
    gatewayOrderId: cfOrder.data.order_id,
    paymentSessionId: cfOrder.data.payment_session_id
  }
  
})
console.log("Cashfree Response:", cfOrder.data);
if (!cfOrder.data.payment_session_id) {
  console.error("Cashfree Full Response:", cfOrder.data)
  throw new Error("Failed to generate payment session")
}
  return {
    paymentSessionId: cfOrder.data.payment_session_id,
    paymentId: payment.id
  }
}

export async function verifyPayment(paymentId: number) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  })

  if (!payment) throw new Error("Payment not found")

  const orderStatus = await cashfreeApi.get(
  `/orders/${payment.gatewayOrderId}`
)

  if (orderStatus.data.order_status === "PAID") {

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      }
    })

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

    return { success: true }
  }

  return { success: false }
}

export async function processRefund(paymentId: number, amount?: number) {

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  })

  if (!payment) throw new Error("Payment not found")

  if (payment.status !== "PAID")
    throw new Error("Only paid payments can be refunded")

  const refundAmount = amount || payment.amount

  // 🔥 CASHFREE V2 REFUND
// 🔥 CASHFREE CORRECT REFUND ENDPOINT
const refund = await cashfreeApi.post(
  `/orders/${payment.gatewayOrderId}/refunds`,
  {
    refund_amount: refundAmount,
    refund_id: `REF_${payment.id}_${Date.now()}`
  }
)

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "REFUNDED",
    }
  })

  if (payment.referenceType === "ORDER") {
    await prisma.order.update({
      where: { id: payment.referenceId },
      data: {
        refundAmount: refundAmount,
        refundStatus: "REFUNDED",
        refundedAt: new Date(),
        status: "CANCELLED"
      }
    })
  }

  return { success: true }
}

