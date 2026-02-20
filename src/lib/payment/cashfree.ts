import axios from "axios"

const baseURL =
  process.env.CASHFREE_MODE === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg"

export const cashfreeApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_APP_ID!,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
    "x-api-version": "2023-08-01"
  }
})
