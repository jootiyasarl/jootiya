"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
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
                                <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                                    <span>Notifications par email</span>
                                    <span className="font-normal text-xs text-zinc-500">
                                        Recevoir des emails pour les nouvelles offres.
                                    </span>
                                </Label>
                                <Switch id="email-notifs" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="push-notifs" className="flex flex-col space-y-1">
                                    <span>Notifications Push</span>
                                    <span className="font-normal text-xs text-zinc-500">
                                        Recevoir des notifications sur votre appareil.
                                    </span>
                                </Label>
                                <Switch id="push-notifs" />
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
                                <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                                    <span>Mode sombre</span>
                                    <span className="font-normal text-xs text-zinc-500">
                                        Activer le thème sombre pour l'interface.
                                    </span>
                                </Label>
                                <Switch id="dark-mode" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Enregistrer les modifications
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
