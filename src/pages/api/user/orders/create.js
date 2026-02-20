import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { calculateDistanceInKm } from "@/lib/calculateDistance";
import { calculateDeliveryCharge } from "@/lib/deliveryRule";

const round = (num) => Math.round(Number(num || 0));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { addressId, cartItems, paymentMethod, couponCode } = req.body;

    if (!addressId || !cartItems?.length) {
      return res.status(400).json({ message: "Invalid data" });
    }

    /* ---------------- ADDRESS ---------------- */
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    /* ---------------- PRODUCTS ---------------- */
    const productIds = cartItems.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        isAvailable: true,
      },
      include: {
        restaurant: true,
        variants: true,
      },
    });

    if (products.length !== cartItems.length) {
      return res.status(400).json({ message: "Some products unavailable" });
    }

    const restaurantId = products[0].restaurantId;
    const restaurant = products[0].restaurant;

    if (!restaurant.isActive || !restaurant.isOpen) {
      return res.status(400).json({ message: "Restaurant closed" });
    }

    /* ---------------- SUBTOTAL ---------------- */
    let subtotal = 0;

    for (const item of cartItems) {
  const product = products.find((p) => p.id === item.productId);
  if (!product) continue;

  let price = product.finalPrice;

  let variantId = item.variantId || null;

  if (variantId) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant) price = variant.finalPrice || variant.price;
  }

  // 🔥 ADD EXTRAS PRICE
  let extrasTotal = 0;

  if (Array.isArray(item.extras)) {
    extrasTotal = item.extras.reduce(
      (sum, ex) => sum + Number(ex.price || 0),
      0
    );
  }

  subtotal += (price + extrasTotal) * item.quantity;
}

    /* ---------------- DELIVERY ---------------- */
    const { userLat, userLng } = req.body;

    if (!userLat || !userLng) {
      return res.status(400).json({ message: "Location required" });
    }

    const distance = calculateDistanceInKm(
      userLat,
      userLng,
      restaurant.latitude,
      restaurant.longitude
    );

    // 🔥 Delivery Charge Calculation (FIXED)
    const deliveryCharge = Math.round(
      await calculateDeliveryCharge(
        restaurantId,
        subtotal,
        distance
      )
    );
    console.log("Distance:", distance);
    console.log("Subtotal:", subtotal);
    console.log("Restaurant:", restaurantId);

    /* ---------------- COUPON VALIDATION ---------------- */
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ message: "Invalid coupon" });
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ message: "Coupon expired" });
      }

      if (coupon.type === "PERCENTAGE") {
        discount = (subtotal * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }

      discount = round(discount);
    }

    /* ---------------- FINAL AMOUNT ---------------- */
    const finalAmount = round(subtotal + deliveryCharge - discount);

    if (finalAmount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    /* ---------------- TRANSACTION ---------------- */
    const order = await prisma.$transaction(async (tx) => {

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber: "ORD" + Date.now(),
          userId: user.id,
          restaurantId,
          addressId,
          totalAmount: subtotal,
          deliveryCharge,
          discount,
          finalAmount,
          couponId: coupon?.id,
          couponCode: coupon?.code,
          paymentMethod: paymentMethod || "COD",
          paymentStatus: "PENDING",
          status: "PENDING",
          
            items: {
  create: cartItems.map((item) => {
    const product = products.find(p => p.id === item.productId);

    let price = product.finalPrice;
    let variantId = item.variantId || null;

    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) price = variant.finalPrice || variant.price;
    }

    // 🔥 CALCULATE EXTRAS
    let extrasTotal = 0;
    let selectedExtras = [];

    if (Array.isArray(item.extras)) {
      selectedExtras = item.extras;
      extrasTotal = item.extras.reduce(
        (sum, ex) => sum + Number(ex.price || 0),
        0
      );
    }

    return {
      productId: product.id,
      variantId: variantId,              // ✅ SAVE VARIANT
      quantity: item.quantity,
      price: round(price + extrasTotal), // ✅ SAVE FINAL ITEM PRICE
      selectedExtras: selectedExtras     // ✅ SAVE EXTRAS
    };
  }),
},
          
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: created.id,
          status: "PENDING",
          changedByRole: "USER",
        },
      });

      return created;
    });

    return res.status(200).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Order Create Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
