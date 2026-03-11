import { Prisma, PaymentMethod as PrismaPaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/server/auth";

const checkoutSchema = z.object({
  paymentMethod: z.enum(["sbp", "card", "invoice"]),
  city: z.string().trim().min(2, "Укажите город."),
  street: z.string().trim().min(2, "Укажите улицу."),
  house: z.string().trim().min(1, "Укажите дом."),
  apartment: z.string().trim().optional(),
  postalCode: z.string().trim().min(3, "Укажите индекс."),
  phone: z.string().trim().min(10, "Укажите корректный телефон."),
});

const paymentMethodMap: Record<
  z.infer<typeof checkoutSchema>["paymentMethod"],
  PrismaPaymentMethod
> = {
  sbp: "SBP",
  card: "CARD",
  invoice: "INVOICE",
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные заказа." },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id },
        include: {
          product: true,
        },
      });

      if (cartItems.length === 0) {
        throw new Error("CART_IS_EMPTY");
      }

      for (const item of cartItems) {
        if (item.quantity > item.product.quantity) {
          throw new Error(`NOT_ENOUGH_STOCK:${item.product.name}`);
        }
      }

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          paymentMethod: paymentMethodMap[parsed.data.paymentMethod],
          city: parsed.data.city,
          street: parsed.data.street,
          house: parsed.data.house,
          apartment: parsed.data.apartment,
          postalCode: parsed.data.postalCode,
          phone: parsed.data.phone,
          totalAmount,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CART_IS_EMPTY") {
      return NextResponse.json(
        { error: "Корзина пуста. Добавьте товары перед оплатой." },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.startsWith("NOT_ENOUGH_STOCK:")) {
      const productName = error.message.split(":")[1] ?? "Товар";
      return NextResponse.json(
        { error: `Недостаточно остатка для товара "${productName}".` },
        { status: 409 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Не удалось оформить заказ из-за конфликта данных." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось оформить заказ. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
