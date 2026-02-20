import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
  /^[6-9]\d{9}$/; // Indian format (adjust if needed)

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
// Min 8 chars, 1 uppercase, 1 lowercase, 1 number

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Request method not allowed",
    });
  }

  try {
    let { name, email, phone, password } = req.body;

    /* ---------------- SANITIZE INPUT ---------------- */

    name = name?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    password = password?.trim();

    /* ---------------- BASIC VALIDATION ---------------- */

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid name",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with uppercase, lowercase and number",
      });
    }

    /* ---------------- CHECK EXISTING USER ---------------- */

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Account already exists. Please try with diffrent email or phone number",
      });
    }

    /* ---------------- HASH PASSWORD ---------------- */

    const hashedPassword = await bcrypt.hash(password, 12);

    /* ---------------- CREATE USER ---------------- */

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "USER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    /* ---------------- SUCCESS RESPONSE ---------------- */

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });

  } catch (error) {
    console.error("REGISTER API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}