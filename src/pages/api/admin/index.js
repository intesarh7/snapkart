import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export default async function handler(req, res) {
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


  const totalUsers = await prisma.user.count();

  return res.json({
    stats: { totalUsers }
  });
}
