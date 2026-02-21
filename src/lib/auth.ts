import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import type { NextApiRequest } from "next";
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
   🍪 GET TOKEN (Pages Router)
================================= */
export const getTokenFromReq = (req: NextApiRequest) => {
  return req.cookies?.snapkart_token || null;
};

/* ===============================
   🍪 GET TOKEN (App Router)
================================= */
export const getTokenFromCookies = async () => {
  try {
    const cookieStore = await cookies();
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
    const token = getTokenFromReq(req);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
    });

    return user;
  } catch (err) {
    console.error("Auth Error (Pages Router):", err);
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
      where: { id: Number(decoded.id) },
    });

    return user;
  } catch (err) {
    console.error("Auth Error (App Router):", err);
    return null;
  }
};

/* ===============================
   🛡 ROLE TYPES
================================= */
type UserRole = "ADMIN" | "USER" | "DELIVERY";

/* ===============================
   🛡 BASE ROLE VERIFY (Internal)
================================= */
const verifyBase = async (
  user: any,
  allowedRoles: UserRole[]
) => {
  if (!user) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized - Please login",
    };
  }

  const normalizedRole = user.role?.toUpperCase() as UserRole;

  if (!allowedRoles.includes(normalizedRole)) {
    return {
      success: false,
      status: 403,
      message: "Forbidden - Access denied",
    };
  }

  return {
    success: true,
    status: 200,
    user,
  };
};

/* ===============================
   🛡 VERIFY USER (Pages Router)
================================= */
export const verifyUser = async (req: NextApiRequest) => {
  const user = await getUserFromRequest(req);
  return verifyBase(user, ["USER"]);
};

/* ===============================
   🛡 VERIFY ADMIN (Pages Router)
================================= */
export const verifyAdmin = async (req: NextApiRequest) => {
  const user = await getUserFromRequest(req);
  return verifyBase(user, ["ADMIN"]);
};

/* ===============================
   🛡 VERIFY DELIVERY (Pages Router)
================================= */
export const verifyDelivery = async (req: NextApiRequest) => {
  const user = await getUserFromRequest(req);
  return verifyBase(user, ["DELIVERY"]);
};

/* ===============================
   🛡 VERIFY MULTIPLE ROLES
================================= */
export const verifyMultipleRoles = async (
  req: NextApiRequest,
  roles: UserRole[]
) => {
  const user = await getUserFromRequest(req);
  return verifyBase(user, roles);
};