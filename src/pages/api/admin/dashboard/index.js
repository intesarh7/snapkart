import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export default async function handler(req, res) {
  const admin = await verifyRole(req, res, ["ADMIN"]);
  if (!admin) return;

  try {
    const totalUsers = await prisma.User.count();
    const totalRestaurants = await prisma.Restaurant?.count() || 0;
    const totalProducts = await prisma.Product?.count() || 0;
    const totalOffers = await prisma.Offer?.count() || 0;

    

    return res.json({
      stats: {
        totalUsers,
        totalRestaurants,
        totalProducts,
        totalOffers,
      },
       
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Dashboard Error" });
  }
}
