import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  // Super admin: admin / Tbg@2026
  const hashedPassword = await hash("Tbg@2026", 12);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Super Admin",
      role: "owner",
      active: true,
    },
  });

  console.log("Seed complete: categories + super admin created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
