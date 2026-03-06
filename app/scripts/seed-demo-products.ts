import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cats = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  for (const c of cats) catMap[c.name] = c.id;

  const products = [
    { sku: "HLM-MT-001", name: "MT Thunder 3 Helmet", categoryId: catMap["Helmets"], brand: "MT Helmets", size: "M", costPrice: 3800, sellingPrice: 5500, mrp: 6200, gstPercentage: 18, stock: 12, description: "Full-face helmet with aerodynamic design. DOT & ISI certified. Anti-scratch visor with quick-release mechanism.", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop" },
    { sku: "HLM-LS2-001", name: "LS2 FF800 Storm Helmet", categoryId: catMap["Helmets"], brand: "LS2", size: "L", costPrice: 6500, sellingPrice: 8900, mrp: 9500, gstPercentage: 18, stock: 8, description: "Premium full-face touring helmet with HPFC shell. Pinlock ready with multi-density EPS liner.", imageUrl: "https://images.unsplash.com/photo-1621265010240-ace7a3502dd3?w=400&h=400&fit=crop" },
    { sku: "HLM-AGV-001", name: "AGV K3 SV Helmet", categoryId: catMap["Helmets"], brand: "AGV", size: "L", costPrice: 10500, sellingPrice: 14500, mrp: 16000, gstPercentage: 18, stock: 4, description: "Race-grade helmet with advanced ventilation. Carbon-fibreglass shell with Integrated Ventilation System.", imageUrl: "https://images.unsplash.com/photo-1569839333583-7375336cde4b?w=400&h=400&fit=crop" },
    { sku: "JKT-RYN-001", name: "Rynox Storm Evo Jacket", categoryId: catMap["Riding Jackets"], brand: "Rynox", size: "L", costPrice: 4200, sellingPrice: 5990, mrp: 6490, gstPercentage: 18, stock: 15, description: "All-weather riding jacket with CE Level 2 armour. Waterproof outer shell with thermal liner.", imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop" },
    { sku: "JKT-BBG-001", name: "BBG Waterproof Jacket", categoryId: catMap["Riding Jackets"], brand: "BBG", size: "XL", costPrice: 3200, sellingPrice: 4490, mrp: 4990, gstPercentage: 18, stock: 10, description: "3-layer waterproof touring jacket with CE armour pockets. Hi-vis reflective panels.", imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=400&h=400&fit=crop" },
    { sku: "GLV-RYN-001", name: "Rynox Air GT Gloves", categoryId: catMap["Riding Gloves"], brand: "Rynox", size: "L", costPrice: 990, sellingPrice: 1490, mrp: 1690, gstPercentage: 18, stock: 25, description: "Summer mesh riding gloves with knuckle protection. Touchscreen compatible fingertips.", imageUrl: "https://images.unsplash.com/photo-1615412704911-55d589229864?w=400&h=400&fit=crop" },
    { sku: "GLV-CRM-001", name: "Cramster Flux Gloves", categoryId: catMap["Riding Gloves"], brand: "Cramster", size: "L", costPrice: 1800, sellingPrice: 2490, mrp: 2890, gstPercentage: 18, stock: 18, description: "Full gauntlet riding gloves with carbon fibre knuckle guard. Goatskin leather palm.", imageUrl: "https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=400&h=400&fit=crop" },
    { sku: "BTS-CRM-001", name: "Cramster Blaster Boots", categoryId: catMap["Riding Boots"], brand: "Cramster", size: "10", costPrice: 2100, sellingPrice: 2990, mrp: 3490, gstPercentage: 18, stock: 9, description: "Ankle-length riding boots with shift pad. Oil-resistant sole with waterproof construction.", imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop" },
    { sku: "ACC-QL-001", name: "Quad Lock Phone Mount", categoryId: catMap["Bike Accessories"], brand: "Quad Lock", costPrice: 2200, sellingPrice: 3200, mrp: 3500, gstPercentage: 18, stock: 30, description: "Vibration dampened phone mount. 360-degree rotation with one-click release system.", imageUrl: "https://images.unsplash.com/photo-1558981033-7c2a5e9e7d30?w=400&h=400&fit=crop" },
    { sku: "BAG-RE-001", name: "Royal Enfield Saddle Bag", categoryId: catMap["Luggage & Bags"], brand: "Royal Enfield", costPrice: 2100, sellingPrice: 2990, mrp: 3490, gstPercentage: 18, stock: 7, description: "Genuine leather saddle bag with quick-mount system. 15L capacity with rain cover.", imageUrl: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=400&fit=crop" },
    { sku: "BAG-VIA-001", name: "Viaterra Claw Mini", categoryId: catMap["Luggage & Bags"], brand: "Viaterra", costPrice: 1400, sellingPrice: 1990, mrp: 2290, gstPercentage: 18, stock: 14, description: "Compact tail bag with expandable design. Reflective accents and rain cover included.", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop" },
    { sku: "PRT-RYN-001", name: "Rynox Knee Guard Pro", categoryId: catMap["Protection Gear"], brand: "Rynox", costPrice: 1300, sellingPrice: 1890, mrp: 2190, gstPercentage: 18, stock: 20, description: "CE Level 2 knee protectors with 3D mesh panels. Adjustable velcro straps for secure fit.", imageUrl: "https://images.unsplash.com/photo-1616697869778-772a01471820?w=400&h=400&fit=crop" },
  ];

  // Filter out products where category wasn't found
  const valid = products.filter((p) => p.categoryId);

  for (const p of valid) {
    await prisma.product.create({ data: p });
  }

  const skipped = products.length - valid.length;
  console.log(`Seeded ${valid.length} demo products${skipped ? ` (${skipped} skipped - missing category)` : ""}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
