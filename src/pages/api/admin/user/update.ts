import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
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
    const { id } = req.query;
    const { name, email, phone, password, role } =
      req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing own role
    if (Number(id) === auth.id && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "You cannot change your own role",
      });
    }

    let updatedData: any = {
      name,
      email,
      phone,
      role,
    };

    // If password provided → hash it
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(
        password,
        10
      );
      updatedData.password = hashed;
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: updatedData,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
