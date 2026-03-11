import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/server/auth";
import { mapUser } from "@/lib/server/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentSessionUser();

  return NextResponse.json({
    user: user ? mapUser(user) : null,
  });
}
