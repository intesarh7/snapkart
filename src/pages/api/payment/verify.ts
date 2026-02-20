import type { NextApiRequest, NextApiResponse } from "next"
import { verifyPayment } from "@/lib/payment/payment.service"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { paymentId } = req.body

    const result = await verifyPayment(paymentId)

    res.status(200).json(result)

  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
