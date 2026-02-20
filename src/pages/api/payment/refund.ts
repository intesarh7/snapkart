import type { NextApiRequest, NextApiResponse } from "next"
import { processRefund } from "@/lib/payment/payment.service"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const { paymentId, amount } = req.body

    const result = await processRefund(paymentId, amount)

    res.status(200).json(result)

  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
