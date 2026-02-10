import { NextResponse } from "next/server";
import { clearAuthSession } from "@/lib/supabase-server";

export async function POST() {
  try {
    await clearAuthSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to clear auth session", error);
    return NextResponse.json(
      { error: "Failed to clear auth session" },
      { status: 500 },
    );
  }
}
