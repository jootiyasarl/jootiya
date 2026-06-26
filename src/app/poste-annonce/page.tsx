import { getServerUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { PostAdPageContent } from "@/components/ads/PostAdPageContent";

export default async function PosteAnnoncePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirectTo=/poste-annonce");
  }

  return <PostAdPageContent />;
}
