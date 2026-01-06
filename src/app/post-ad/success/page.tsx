import { Suspense } from "react";
import { PostAdSuccessContent } from "./PostAdSuccessContent";

export default function PostAdSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <PostAdSuccessContent />
    </Suspense>
  );
}
