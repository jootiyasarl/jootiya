import { getServerUser } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { PostAdPageContent } from "@/components/ads/PostAdPageContent";

export default async function PostAdPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?next=/poste-annonce");
  }

  return <PostAdPageContent />;
}
