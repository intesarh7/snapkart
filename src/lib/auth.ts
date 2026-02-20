import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/* ===============================
   🔐 SIGN TOKEN
================================= */
export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ===============================
   🔍 VERIFY TOKEN
================================= */
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
};

/* ===============================
   🍪 GET TOKEN FROM REQUEST
   (Works for Pages Router)
================================= */
export const getTokenFromReq = (req: NextApiRequest) => {
  return req.cookies?.snapkart_token || null;
};

/* ===============================
   🍪 GET TOKEN (App Router - Next 15 Safe)
================================= */
export const getTokenFromCookies = async () => {
  try {
    const cookieStore = await cookies();   // 🔥 await required
    return cookieStore.get("snapkart_token")?.value || null;
  } catch {
    return null;
  }
};

/* ===============================
   👤 GET USER (Pages Router)
================================= */
export const getUserFromRequest = async (
  req: NextApiRequest
) => {
  try {
    const token = req.cookies?.snapkart_token;
    console.log("Token:", token);

    if (!token) return null;

    const decoded = verifyToken(token);
    console.log("Decoded:", decoded);

    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
    });

    console.log("User from DB:", user);

    return user;
  } catch (err) {
    console.log("Auth error:", err);
    return null;
  }
};

/* ===============================
   👤 GET USER (App Router)
================================= */
export const getUserFromAppRouter = async () => {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) }, // 🔥 FIX HERE
    });

    return user;
  } catch {
    return null;
  }
};

/* ===============================
   🛡 VERIFY ROLE (Generic - Pages Router)
================================= */

type UserRole = "ADMIN" | "USER" | "DELIVERY";

export const verifyRole = async (
  req: NextApiRequest,
  allowedRoles: UserRole[]
) => {
  const user = await getUserFromRequest(req);
  if (!user) return null;

  const normalizedRole = user.role?.toUpperCase();

  if (!allowedRoles.includes(normalizedRole as UserRole)) {
    return null;
  }

  return user;
};
