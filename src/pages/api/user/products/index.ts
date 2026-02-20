import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = "1", limit = "8", category, sort } = req.query;

  const pageNumber = Number(page);
  const take = Number(limit);
  const skip = (pageNumber - 1) * take;

  let orderBy: any = { createdAt: "desc" };

  if (sort === "priceLow") orderBy = { finalPrice: "asc" };
  if (sort === "priceHigh") orderBy = { finalPrice: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };

  const where: any = {
    isActive: true,
    isAvailable: true,
  };

  if (category && category !== "All") {
    where.category = category;
  }

  const products = await prisma.product.findMany({
  where,
  include: {
    restaurant: {
      select: {
        id: true,
        name: true,
        address: true,
        deliveryTime: true,
      },
    },
    variants: {
  select: {
    id: true,
    name: true,
    price: true,
    finalPrice: true,
  },
},
extras: {
  select: {
    id: true,
    name: true,
    price: true,
  },
},
  },
  orderBy,
  skip,
  take,
});

  const total = await prisma.product.count({ where });

  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
  });

  res.status(200).json({
    products,
    totalPages: Math.ceil(total / take),
    categories: categories.map((c) => c.category),
  });
}
