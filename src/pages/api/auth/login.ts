import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /* ---------------- METHOD CHECK ---------------- */

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Request method not allowed",
    });
  }

  try {
    const { email, password } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    /* ---------------- FIND USER ---------------- */

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Do NOT reveal whether user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ---------------- CHECK ACTIVE STATUS ---------------- */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account temporarily unavailable",
      });
    }

    /* ---------------- PASSWORD VERIFY ---------------- */

    const isValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ---------------- JWT SECRET CHECK ---------------- */

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Authentication service unavailable",
      });
    }

    /* ---------------- TOKEN CREATE ---------------- */

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* ---------------- SECURE COOKIE ---------------- */

    res.setHeader(
      "Set-Cookie",
      serialize("snapkart_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    /* ---------------- SUCCESS RESPONSE ---------------- */

    return res.status(200).json({
      success: true,
      role: user.role,
    });

  } catch (error) {
    // Log internally only
    console.error("Login API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}