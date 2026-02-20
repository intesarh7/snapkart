import prisma from "@/lib/prisma";

export async function calculateDeliveryCharge(
  restaurantId,
  cartTotal,
  distance
) {
  console.log("---- DELIVERY CALCULATION ----");
  console.log("Restaurant:", restaurantId);
  console.log("Cart Total:", cartTotal);
  console.log("Distance:", distance);

  const rule = await prisma.deliveryRule.findFirst({
    where: {
      restaurantId,
      isActive: true,
    },
  });

  console.log("Matched Rule:", rule);

  if (!rule) {
    console.log("No rule found. Returning 0.");
    return 0;
  }

  const baseDistance = rule.baseDistance ?? 5;
  const baseCharge = rule.chargeAmount ?? 0;
  const perKmCharge = rule.perKmCharge ?? 0;
  const minOrder = rule.minOrder ?? 0;

  let charge = 0;

  // 🔥 Distance within base range
  if (distance <= baseDistance) {
    if (cartTotal >= minOrder) {
      charge = 0; // Free delivery
    } else {
      charge = baseCharge; // Base charge
    }
  }

  // 🔥 Distance greater than base
  else {
    const extraKm = Math.ceil(distance - baseDistance);
    charge = baseCharge + (extraKm * perKmCharge);
  }

  console.log("Final Delivery Charge:", charge);

  return Math.round(charge);
}
