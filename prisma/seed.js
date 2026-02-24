import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      name: "SnapKart Admin",
      phone: "9999999999",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Normal User
  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      name: "Test User",
      phone: "8888888888",
      email: "user@gmail.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  // Delivery Boy
  await prisma.user.upsert({
    where: { email: "del@gmail.com" },
    update: {},
    create: {
      name: "Delivery Boy",
      phone: "7777777777",
      email: "del@gmail.com",
      password: hashedPassword,
      role: "DELIVERY",
    },
  });

  console.log("✅ Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });