"use client";

import { useEffect, useState, type FormEvent, useCallback } from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Camera, User, Loader2 } from "lucide-react";
import Image from "next/image";

interface PersonalInfoForm {
  name: string;
  phone: string;
  city: string;
  email?: string;
  push_enabled: boolean;
  avatar_url?: string;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export function ProfileForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>({
    name: "",
    phone: "",
    city: "",
    email: "",
    push_enabled: true,
    avatar_url: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async (cancelled: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setError("You must be signed in to edit your profile.");
        return;
      }

      if (cancelled) return;
      const user = session.user;
      setUserId(user.id);

      let initialData: PersonalInfoForm = {
        name: "",
        phone: "",
        city: "",
        email: user.email || "",
        push_enabled: true,
        avatar_url: "",
      };

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone, city, push_enabled, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled && !profileError && profile) {
        initialData = {
          ...initialData,
          name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          city: profile.city ?? "",
          push_enabled: profile.push_enabled ?? true,
          avatar_url: profile.avatar_url ?? "",
        };
      }
      setPersonalInfo(initialData);
    } catch (err: any) {
      if (cancelled) return;
      setError(err.message ?? "Failed to load profile.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadProfile(cancelled);
    return () => { cancelled = true; };
  }, [loadProfile]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || userId;

    if (!currentUserId) {
      setError("You must be signed in to save your profile.");
      return;
    }

    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: currentUserId,
          full_name: personalInfo.name,
          phone: personalInfo.phone,
          city: personalInfo.city,
          email: personalInfo.email,
          avatar_url: personalInfo.avatar_url,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (upsertError) throw upsertError;
      setSuccess("Profile updated.");
      toast.success("Profile updated successfully");
    } catch (err: any) {
      setError(err.message ?? "Failed to save profile.");
      toast.error("Failed to save profile");
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
      if (updateError) throw updateError;
      setSuccess("Password changed successfully.");
      toast.success("Password changed successfully");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message ?? "Failed to change password.");
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // Get session immediately before any operation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        setUploadingAvatar(false);
        return;
      }

      const currentUserId = session.user.id;

      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image valide.");
        setUploadingAvatar(false);
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("L'image est trop volumineuse (max 2MB).");
        setUploadingAvatar(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`; // Using root of ad-images since avatars folder might not exist

      // 1. Upload to Supabase Storage (Using existing ad-images bucket)
      const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      // 3. Update Profile locally and in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPersonalInfo(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Photo de profil mise à jour.");
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      toast.error("Échec du téléchargement de l'image.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAvatar() {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || userId;

    if (!currentUserId) {
      toast.error("You must be signed in to perform this action.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', currentUserId);
      if (error) throw error;
      setPersonalInfo(prev => ({ ...prev, avatar_url: "" }));
      toast.success("Photo supprimée.");
    } catch (e) {
      toast.error("Échec de la suppression.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAccount() {
    if (!userId) {
      toast.error("Vous devez être connecté pour supprimer votre compte.");
      return;
    }

    setDeletingAccount(true);
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      toast.success("Compte déconnecté. Redirection...");
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err: any) {
      toast.error(err.message ?? "Échec de la déconnexion.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="rounded-2xl border bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-6 mb-8 border-b pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-900">Photo de profil</h2>
            <p className="text-xs text-zinc-500">Ajoutez une photo pour inspirer confiance à vos acheteurs.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full border-4 border-zinc-50 bg-zinc-100 overflow-hidden flex items-center justify-center shadow-sm">
                {personalInfo.avatar_url ? (
                  <Image src={personalInfo.avatar_url} alt="Avatar" width={96} height={96} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-zinc-300" />
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-orange-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-zinc-400 max-w-[200px]">Format JPG, PNG ou WebP. Max 2MB.</p>
              {personalInfo.avatar_url && (
                <button type="button" onClick={handleDeleteAvatar} className="text-[11px] font-bold text-red-500 hover:text-red-600 text-left">
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-900">Personal information</h2>
          <p className="text-xs text-zinc-500">Update your name, phone number, and city.</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={personalInfo.name} onChange={(e) => setPersonalInfo(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" disabled={loading || savingProfile} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={personalInfo.phone} onChange={(e) => setPersonalInfo(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" disabled={loading || savingProfile} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={personalInfo.city} onChange={(e) => setPersonalInfo(p => ({ ...p, city: e.target.value }))} placeholder="City" disabled={loading || savingProfile} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={loading || savingProfile}>
            {savingProfile ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="rounded-2xl border bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-900">Change password</h2>
          <p className="text-xs text-zinc-500">Set a new password to secure your seller account.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="New password" disabled={changingPassword} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat new password" disabled={changingPassword} />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? "Updating..." : "Change password"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-sm font-semibold text-zinc-900">Paramètres des notifications</h2>
          <p className="text-xs text-zinc-500">Gérez comment vous recevez les alertes.</p>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-zinc-900">Notifications Push</span>
            <span className="text-[10px] text-zinc-400">Recevoir des notifications directes</span>
          </div>
          <button
            onClick={async () => {
              const newValue = !personalInfo.push_enabled;
              setSavingProfile(true);
              try {
                const { error } = await supabase.from('profiles').update({ push_enabled: newValue }).eq('id', userId);
                if (error) throw error;
                setPersonalInfo(prev => ({ ...prev, push_enabled: newValue }));
                toast.success(newValue ? "Notifications activées" : "Notifications désactivées");
              } catch (e) {
                toast.error("Échec de la modification");
              } finally {
                setSavingProfile(false);
              }
            }}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2",
              personalInfo.push_enabled ? "bg-orange-600" : "bg-zinc-200"
            )}
          >
            <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", personalInfo.push_enabled ? "translate-x-5" : "translate-x-0")} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-red-700">Delete account</h2>
          <p className="text-xs text-red-600">This will sign you out from all devices.</p>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="max-w-sm text-xs text-red-600">This action will disconnect your current session.</p>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600">
              Supprimer mon compte
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer le compte</DialogTitle>
                <DialogDescription>Êtes-vous sûr ? Cette action vous déconnectera.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Annuler
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
                  {deletingAccount ? "Suppression..." : "Oui, supprimer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
