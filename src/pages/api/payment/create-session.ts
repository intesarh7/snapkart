import type { NextApiRequest, NextApiResponse } from "next"
import { createPaymentSession } from "@/lib/payment/payment.service"
import { verifyRole } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" })
    }

   const user = await verifyRole(req, res, ["USER"]);


    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { referenceType, referenceId } = req.body

    if (!referenceType || !referenceId) {
      return res.status(400).json({ message: "Missing reference data" })
    }

    const data = await createPaymentSession({
      userId: user.id,
      referenceType,
      referenceId,
      amount: 0
    })

    return res.status(200).json(data)

  } catch (err: any) {
    console.error("Payment Session Error:", err)
    return res.status(400).json({ message: err.message })
  }
}
