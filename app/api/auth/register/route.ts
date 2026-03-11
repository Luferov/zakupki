import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachSessionCookie, createSession } from "@/lib/server/auth";
import { mapUser } from "@/lib/server/mappers";

const registerSchema = z.object({
  email: z.string().trim().email("Некорректный email."),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов."),
  name: z.string().trim().min(2).max(100).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже зарегистрирован." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name ?? null,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const { token, expiresAt } = await createSession(user.id);
  const response = NextResponse.json({
    user: mapUser(user),
  });
  attachSessionCookie(response, token, expiresAt);

  return response;
}
