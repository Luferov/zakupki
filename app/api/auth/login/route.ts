import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachSessionCookie, createSession } from "@/lib/server/auth";
import { mapUser } from "@/lib/server/mappers";

const loginSchema = z.object({
  email: z.string().trim().email("Некорректный email."),
  password: z.string().min(1, "Введите пароль."),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден." },
      { status: 404 },
    );
  }

  const isPasswordValid = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    return NextResponse.json({ error: "Неверный пароль." }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(user.id);
  const response = NextResponse.json({
    user: mapUser(user),
  });
  attachSessionCookie(response, token, expiresAt);

  return response;
}
