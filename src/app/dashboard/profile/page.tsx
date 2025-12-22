"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Profile settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your personal information, update your password, and
            control your seller account.
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
}
