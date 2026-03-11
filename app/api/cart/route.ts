import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/server/auth";
import { mapCartItem } from "@/lib/server/mappers";

const addToCartSchema = z.object({
  productId: z.string().cuid(),
});

async function getCartPayload(userId: string) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
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
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const items = cartItems.map(mapCartItem);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    total,
    count,
  };
}

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 },
    );
  }

  const cart = await getCartPayload(user.id);
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = addToCartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный идентификатор товара." },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, quantity: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Товар не найден." }, { status: 404 });
  }

  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: product.id,
      },
    },
    select: { id: true, quantity: true },
  });

  const nextQuantity = (existingCartItem?.quantity ?? 0) + 1;
  if (nextQuantity > product.quantity) {
    return NextResponse.json(
      { error: "Нельзя добавить больше доступного остатка." },
      { status: 400 },
    );
  }

  if (existingCartItem) {
    await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 1,
      },
    });
  }

  const cart = await getCartPayload(user.id);
  return NextResponse.json(cart);
}

export async function DELETE(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { error: "Не указан productId." },
      { status: 400 },
    );
  }

  await prisma.cartItem.deleteMany({
    where: {
      userId: user.id,
      productId,
    },
  });

  const cart = await getCartPayload(user.id);
  return NextResponse.json(cart);
}
