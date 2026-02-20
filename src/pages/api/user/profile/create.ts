import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return res.status(401).json({ message: "Unauthorized" });

    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (!fullName || !phone || !address || !city || !state || !pincode)
      return res.status(400).json({ message: "All fields required" });

    const existingCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
        latitude: 0,
        longitude: 0,
        isDefault: existingCount === 0, // first address auto default
      },
    });

    return res.status(200).json({ address: newAddress });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
