import { syncMissingEmbeddings } from "@/lib/ai/sync";
import { getServerUser, getProfileRole } from "@/lib/supabase-server";

export async function syncEmbeddingsAction() {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const role = await getProfileRole(user.id);
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Forbidden: Admin access required");
  }

  try {
    await syncMissingEmbeddings();
    return { success: true, message: "Sync batch started successfully" };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, message: "Failed to start sync" };
  }
}
