"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { updatePasswordAction } from "@/app/dashboard/profile/actions";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!newPassword) {
      toast.error("Veuillez entrer un nouveau mot de passe.");
      setLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const result = await updatePasswordAction(newPassword);
      if (result.error) throw new Error(result.error);
      toast.success("Mot de passe mis à jour avec succès.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
          Nouveau mot de passe
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
          />
          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
          Confirmer le mot de passe
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
          />
          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 text-base font-black rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Mise à jour...
          </>
        ) : (
          "Mettre à jour le mot de passe"
        )}
      </Button>
    </form>
  );
}
