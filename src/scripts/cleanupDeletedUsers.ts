import prisma from "@/lib/prisma";

async function cleanup() {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  await prisma.user.deleteMany({
    where: {
      isDeleted: true,
      deletedAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  console.log("Old deleted users permanently removed");
}

cleanup().finally(() => prisma.$disconnect());