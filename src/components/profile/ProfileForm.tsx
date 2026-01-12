"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

interface PersonalInfoForm {
  name: string;
  phone: string;
  city: string;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export function ProfileForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>(
    {
      name: "",
      phone: "",
      city: "",
    },
  );
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setError("You must be signed in to edit your profile.");
          return;
        }

        if (cancelled) return;

        setUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, city")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled && !profileError && profile) {
          setPersonalInfo({
            name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            city: profile.city ?? "",
          });
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message ?? "Failed to load profile.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setError("You must be signed in to save your profile.");
      return;
    }

    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: personalInfo.name,
            phone: personalInfo.phone,
            city: personalInfo.city,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (upsertError) {
        throw upsertError;
      }

      setSuccess("Profile updated.");
    } catch (err: any) {
      setError(err.message ?? "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordForm.newPassword) {
      setError("New password is required.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Password changed successfully.");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message ?? "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (!userId) {
      setError("You must be signed in to delete your account.");
      return;
    }

    setDeletingAccount(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Account deletion requested", { userId });

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setSuccess(
        "Account deletion requested. You have been signed out. Connect this action to a backend delete endpoint.",
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={handleProfileSubmit}
        className="rounded-2xl border bg-white p-4 sm:p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-900">
            Personal information
          </h2>
          <p className="text-xs text-zinc-500">
            Update your name, phone number, and city.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={personalInfo.name}
              onChange={(event) =>
                setPersonalInfo((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder="Your full name"
              disabled={loading || savingProfile}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(event) =>
                setPersonalInfo((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
              placeholder="Phone number"
              disabled={loading || savingProfile}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={personalInfo.city}
              onChange={(event) =>
                setPersonalInfo((prev) => ({
                  ...prev,
                  city: event.target.value,
                }))
              }
              placeholder="City"
              disabled={loading || savingProfile}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={loading || savingProfile}
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-2xl border bg-white p-4 sm:p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-900">
            Change password
          </h2>
          <p className="text-xs text-zinc-500">
            Set a new password to secure your seller account.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              placeholder="New password"
              disabled={changingPassword}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              placeholder="Repeat new password"
              disabled={changingPassword}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={changingPassword}
          >
            {changingPassword ? "Updating..." : "Change password"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-red-700">
            Delete account
          </h2>
          <p className="text-xs text-red-600">
            This will sign you out and should be connected to a backend
            process that permanently removes your data from Supabase.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="max-w-sm text-xs text-red-600">
            This action is irreversible once fully implemented in your
            backend. Make sure you have exported any data you need
            beforehand.
          </p>

          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600">
              Delete account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your seller account?
                  You will be signed out. Permanent data deletion should
                  be handled by your backend.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose
                  type="button"
                  className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? "Deleting..." : "Yes, delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
