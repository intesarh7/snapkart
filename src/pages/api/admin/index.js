import prisma from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export default async function handler(req, res) {
  const admin = await verifyRole(req, res, ["ADMIN"]);
  if (!admin) return;


  const totalUsers = await prisma.user.count();

  return res.json({
    stats: { totalUsers }
  });
}
