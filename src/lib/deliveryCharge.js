import prisma from "@/lib/prisma";

export async function calculateDeliveryCharge(
  restaurantId,
  cartTotal,
  distanceKm
) {
  const rule = await prisma.deliveryRule.findFirst({
    where: {
      restaurantId,
      isActive: true,
      minOrder: { lte: cartTotal },
      OR: [
        { maxOrder: null },
        { maxOrder: { gte: cartTotal } },
      ],
    },
  });

  if (!rule) return 0;

  if (rule.chargeType === "FREE") {
    return 0;
  }

  const baseDistance = rule.baseDistance || 5;
  const baseCharge = rule.chargeAmount || 0;
  const perKmCharge = rule.perKmCharge || 0;

  if (distanceKm <= baseDistance) {
    return baseCharge;
  }

  const extraKm = Math.ceil(distanceKm - baseDistance);

  return baseCharge + (extraKm * perKmCharge);
}
