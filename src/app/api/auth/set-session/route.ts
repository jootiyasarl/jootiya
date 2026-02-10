import { NextResponse } from "next/server";
import type { Session } from "@supabase/supabase-js";
import { setAuthSession } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { session?: Session | null };
    const session = body.session;

    if (!session || !session.access_token) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    await setAuthSession(session);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to set auth session", error);
    return NextResponse.json(
      { error: "Failed to set auth session" },
      { status: 500 },
    );
  }
}
