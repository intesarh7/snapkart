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
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch {
    return null;
  }
};

/* ===============================
   👤 GET USER (App Router)
================================= */
export const getUserFromAppRouter = async () => {
  try {
    const token = await getTokenFromCookies();  // 🔥 await
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
  res: NextApiResponse,
  allowedRoles: UserRole[]
) => {
  const user = await getUserFromRequest(req);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    res.status(403).json({ message: "Access Denied" });
    return null;
  }

  return user;
};
