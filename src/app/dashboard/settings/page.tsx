"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        email_notifications: true,
        push_notifications: false,
        dark_mode: false,
    });

    useEffect(() => {
        async function loadSettings() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("push_enabled")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                if (profile) {
                    setSettings(prev => ({
                        ...prev,
                        push_notifications: profile.push_enabled ?? false,
                    }));
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("profiles")
                .update({ 
                    push_enabled: settings.push_notifications,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

            if (error) throw error;
            toast.success("Paramètres enregistrés avec succès");
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pb-16 pt-8 dark:bg-zinc-950">
            <div className="mx-auto w-full max-w-3xl px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                        Paramètres
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Gérez vos préférences de navigation et de notifications.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Notifications Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Choisissez comment vous souhaitez être notifié.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="email-notifs" className="flex flex-col space-y-1 cursor-pointer">
                                    <span>Notifications par email</span>
                                    <span className="font-normal text-xs text-zinc-500">
                                        Recevoir des emails pour les nouvelles offres.
                                    </span>
                                </Label>
                                <Switch 
                                    id="email-notifs" 
                                    checked={settings.email_notifications}
                                    onCheckedChange={(val) => setSettings(p => ({ ...p, email_notifications: val }))}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="push-notifs" className="flex flex-col space-y-1 cursor-pointer">
                                    <span>Notifications Push</span>
                                    <span className="font-normal text-xs text-zinc-500">
                                        Recevoir des notifications sur votre appareil.
                                    </span>
                                </Label>
                                <Switch 
                                    id="push-notifs" 
                                    checked={settings.push_notifications}
                                    onCheckedChange={(val) => setSettings(p => ({ ...p, push_notifications: val }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Apparence</CardTitle>
                            <CardDescription>
                                Personnalisez l'apparence de l'application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="dark-mode" className="flex flex-col space-y-1 cursor-pointer">
                                    <span>Mode sombre</span>
                                    <span className="font-normal text-xs text-zinc-500">
                                        Activer le thème sombre pour l'interface.
                                    </span>
                                </Label>
                                <Switch 
                                    id="dark-mode" 
                                    checked={settings.dark_mode}
                                    onCheckedChange={(val) => setSettings(p => ({ ...p, dark_mode: val }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                "Enregistrer les modifications"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
