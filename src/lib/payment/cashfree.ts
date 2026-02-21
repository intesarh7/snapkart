import axios from "axios";

const isProd = process.env.CASHFREE_MODE === "PRODUCTION";

export const cashfreeApi = axios.create({
  baseURL: isProd
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg",
  headers: {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
    "x-api-version": "2022-09-01",
  },
});
