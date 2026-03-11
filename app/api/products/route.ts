import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/server/auth";
import { mapProduct } from "@/lib/server/mappers";

const productCategorySchema = z.enum([
  "Электроника",
  "Дом",
  "Одежда",
  "Спорт",
  "Другое",
]);

const productFieldsSchema = z.object({
  name: z.string().trim().min(2, "Название должно быть не короче 2 символов."),
  description: z.string().trim().min(3, "Добавьте описание товара."),
  category: productCategorySchema,
  price: z.coerce.number().int().min(1, "Цена должна быть не меньше 1 рубля."),
  quantity: z.coerce.number().int().min(1, "Количество должно быть не меньше 1."),
});

const imageMimeToExtension = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

async function storeImage(file: File) {
  const extension = imageMimeToExtension.get(file.type);
  if (!extension) {
    throw new Error("Поддерживаются только JPG и PNG изображения.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadsDirectory, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const absolutePath = path.join(uploadsDirectory, fileName);
  await writeFile(absolutePath, bytes);

  return `/uploads/products/${fileName}`;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
          maxHandle: true,
          whatsapp: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    products: products.map(mapProduct),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const rawImage = formData.get("image");
  const imageFile = rawImage instanceof File && rawImage.size > 0 ? rawImage : null;

  const parsedFields = productFieldsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
  });

  if (!parsedFields.success) {
    return NextResponse.json(
      { error: parsedFields.error.issues[0]?.message ?? "Некорректные данные товара." },
      { status: 400 },
    );
  }

  if (imageFile && imageFile.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Размер изображения не должен превышать 10 МБ." },
      { status: 400 },
    );
  }

  let imagePath = "/file.svg";
  if (imageFile) {
    try {
      imagePath = await storeImage(imageFile);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось сохранить изображение.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const createdProduct = await prisma.product.create({
    data: {
      ...parsedFields.data,
      imagePath,
      sellerId: user.id,
    },
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
          maxHandle: true,
          whatsapp: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      product: mapProduct(createdProduct),
    },
    { status: 201 },
  );
}
