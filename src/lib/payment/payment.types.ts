export type CreatePaymentPayload = {
  userId: number
  referenceType: "ORDER" | "BOOKING"
  referenceId: number
  amount: number
  currency?: string
}
