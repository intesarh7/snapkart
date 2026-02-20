import { prisma } from "@/lib/prisma";

export async function getWebsiteSettings() {
  const settings = await prisma.websiteSetting.findFirst();

  return settings || null;
}
