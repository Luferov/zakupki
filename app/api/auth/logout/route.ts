import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  getSessionToken,
  removeSessionByToken,
} from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = await getSessionToken();
  await removeSessionByToken(token);

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);

  return response;
}
