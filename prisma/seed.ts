import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_PRODUCTS } from "../lib/marketplace";

const prisma = new PrismaClient();

async function upsertUser(email: string, name: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: {
      email,
      name,
      passwordHash,
    },
  });
}

async function main() {
  const seller = await upsertUser(
    "demo-seller@zakupki.local",
    "Демо продавец",
    "demo12345",
  );

  await upsertUser("demo-user@zakupki.local", "Демо покупатель", "demo12345");

  const existingProductsCount = await prisma.product.count({
    where: { sellerId: seller.id },
  });

  if (existingProductsCount === 0) {
    await prisma.product.createMany({
      data: DEFAULT_PRODUCTS.map((product) => ({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        imagePath: product.image,
        sellerId: seller.id,
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
