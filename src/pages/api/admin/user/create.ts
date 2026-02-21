import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

 
     /* ===============================
           🔐 VERIFY ADMIN
        ================================= */
        const auth = await verifyAdmin(req);
      
        if (!auth.success) {
          return res.status(auth.status).json({
            success: false,
            message: auth.message,
          });
        } 
     

  try {
    const { name, email, phone, password, role } = req.body;

    /* -------- VALIDATION -------- */

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields including role are required",
      });
    }

    // ✅ Allow all roles
    const allowedRoles = ["ADMIN", "DELIVERY", "USER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    /* -------- CHECK EMAIL EXIST -------- */

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    /* -------- CHECK PHONE EXIST -------- */

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone already exists",
      });
    }

    /* -------- HASH PASSWORD -------- */

    const hashedPassword = await bcrypt.hash(password, 10);

    /* -------- CREATE USER -------- */

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
