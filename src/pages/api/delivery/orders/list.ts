import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyDelivery } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    /* ===============================
       🔐 VERIFY DELIVERY
    ================================= */
    const auth = await verifyDelivery(req);

    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }
    // ✅ PAGINATION LOGIC
    const page = Number(req.query.page || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const deliveryBoy = auth.user;

    /* ===============================
       📦 FETCH ACTIVE DELIVERY ORDERS
    ================================= */
    const [orders, total] = await Promise.all([

      prisma.order.findMany({
        where: {
          deliveryBoyId: deliveryBoy.id,
          status: "OUT_FOR_DELIVERY",
        },
        orderBy: { createdAt: "desc" },

        skip,   // ✅ ADD THIS
        take: limit,   // ✅ ADD THIS

        include: {
          address: true,

          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },

          restaurant: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true,
            },
          },

          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  finalPrice: true,
                },
              },
            },
          },
        },
      }),

      // ✅ COUNT TOTAL RECORDS
      prisma.order.count({
        where: {
          deliveryBoyId: deliveryBoy.id,
          status: "OUT_FOR_DELIVERY",
        },
      }),

    ]);
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productName: item.product?.name || null,
        productImage: item.product?.image || null,
        variantName: item.variant?.name || null,
        extras: item.selectedExtras || [],   // 🔥 Your actual extras
        finalPrice: Number(item.price || item.price || 0),
      })),
    }));
    return res.status(200).json({
      success: true,
      orders: formattedOrders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    })





  } catch (error) {
    console.error("Delivery Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}