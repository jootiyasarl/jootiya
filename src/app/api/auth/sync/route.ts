import { NextResponse } from "next/server";
import { setAuthSession, setSellerSession } from "@/lib/supabase-server";

const ADMIN_EMAIL = "jootiyasarl@gmail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = body?.session;
    if (!session?.access_token) {
      return NextResponse.json({ ok: false, error: "missing_session" }, { status: 400 });
    }

    const role = session.user?.email === ADMIN_EMAIL ? "admin" : "seller";

    await setAuthSession(session);
    await setSellerSession(session, role);

    return NextResponse.json({ ok: true, role });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
