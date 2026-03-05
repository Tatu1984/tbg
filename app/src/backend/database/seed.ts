import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    "Helmets",
    "Riding Jackets",
    "Riding Gloves",
    "Riding Boots",
    "Bike Accessories",
    "Bike Parts",
    "Luggage & Bags",
    "Protection Gear",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
