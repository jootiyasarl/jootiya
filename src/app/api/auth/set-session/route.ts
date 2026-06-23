import { NextResponse } from "next/server";
import { createClient, type Session } from "@supabase/supabase-js";
import { setAuthSession } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { session?: Session | null };
    const session = body.session;

    if (!session || !session.access_token) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    await setAuthSession(session);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceRoleKey && session.user?.id) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false },
      });

      const isAdmin = session.user.email === "jootiyasarl@gmail.com";
      const metadata = session.user.user_metadata ?? {};

      const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: session.user.id,
          email: session.user.email ?? null,
          full_name: metadata.full_name || metadata.name || "",
          avatar_url: metadata.avatar_url || metadata.picture || null,
          role: isAdmin ? "super_admin" : "seller",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (profileError) {
        console.error("Profile upsert error:", profileError.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to set auth session", error);
    return NextResponse.json(
      { error: "Failed to set auth session" },
      { status: 500 },
    );
  }
}
