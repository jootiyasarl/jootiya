import { NextResponse } from "next/server";
import { createSupabaseServerClient, getServerUser, getProfileRole } from "@/lib/supabase-server";
import { generateEmbedding } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * API route to backfill embeddings for ads that don't have them.
 * Protected: Only admins or authorized users should run this.
 */
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getProfileRole(user.id);
    if (role !== "admin") {
      // For now, if you are the developer and don't have 'admin' role yet, 
      // you might need to check by email or temporarily allow your ID.
      const authorizedEmails = ["bartouchy@example.com"]; // Replace with your admin email
      if (!authorizedEmails.includes(user.email || "")) {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
    }

    const supabase = createSupabaseServerClient();

    // Fetch ads that need embeddings
    const { data: ads, error: fetchError } = await supabase
      .from("ads")
      .select("id, title, description")
      .is("embedding", null)
      .eq("status", "active")
      .limit(50); // Process in batches to avoid timeouts

    if (fetchError) throw fetchError;

    if (!ads || ads.length === 0) {
      return NextResponse.json({ message: "No ads need backfilling." });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const ad of ads) {
      try {
        const combinedText = `${ad.title} ${ad.description || ""}`.trim();
        const embedding = await generateEmbedding(combinedText);

        const { error: updateError } = await supabase
          .from("ads")
          .update({ embedding })
          .eq("id", ad.id);

        if (updateError) {
          console.error(`Failed to update ad ${ad.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing ad ${ad.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      message: "Backfill process completed for batch",
      processed: ads.length,
      success: successCount,
      errors: errorCount,
      remaining: "Check again to process next batch if needed"
    });

  } catch (error: any) {
    console.error("Backfill API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
