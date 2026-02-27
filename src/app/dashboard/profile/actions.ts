"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedServerClient, getServerUser } from "@/lib/supabase-server";

export async function updateProfile(formData: {
  full_name: string;
  phone: string;
  city: string;
  email?: string;
  avatar_url?: string;
}) {
  const user = await getServerUser();
  if (!user) {
    return { error: "Session expiré. Veuillez vous reconnecter." };
  }

  const supabase = await getAuthenticatedServerClient();
  
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: formData.full_name,
      phone: formData.phone,
      city: formData.city,
      email: formData.email,
      avatar_url: formData.avatar_url,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function uploadAvatarAction(base64Image: string, fileName: string) {
  const user = await getServerUser();
  if (!user) {
    return { error: "Session expiré. Veuillez vous reconnecter." };
  }

  const supabase = await getAuthenticatedServerClient();

  // Convert base64 to Buffer
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const fileExt = fileName.split('.').pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("ad-images")
    .upload(filePath, buffer, {
      contentType: `image/${fileExt}`,
      upsert: true
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("ad-images")
    .getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, publicUrl };
}

export async function deleteAvatarAction() {
  const user = await getServerUser();
  if (!user) {
    return { error: "Session expiré. Veuillez vous reconnecter." };
  }

  const supabase = await getAuthenticatedServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updatePasswordAction(password: string) {
  const user = await getServerUser();
  if (!user) {
    return { error: "Session expiré. Veuillez vous reconnecter." };
  }

  const supabase = await getAuthenticatedServerClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateNotificationsAction(enabled: boolean) {
  const user = await getServerUser();
  if (!user) {
    return { error: "Session expiré. Veuillez vous reconnecter." };
  }

  const supabase = await getAuthenticatedServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ push_enabled: enabled })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
