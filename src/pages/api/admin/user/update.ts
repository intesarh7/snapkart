import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
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

    const admin = auth.user;

    

    /* ===============================
       🆔 VALIDATE ID
    ================================= */
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid User ID required",
      });
    }

    const userId = Number(id);

    const { name, email, phone, password, role } = req.body;

    /* ===============================
       🔎 CHECK USER EXISTS
    ================================= */
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ===============================
       🚫 PREVENT SELF ROLE CHANGE
    ================================= */
    if (userId === admin.id && role && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    /* ===============================
       📝 PREPARE UPDATE DATA
    ================================= */
    const updatedData: any = {
      name,
      email,
      phone,
      role,
    };

    // Hash password if provided
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updatedData.password = hashed;
    }

    /* ===============================
       💾 UPDATE USER
    ================================= */
    await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });

  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}