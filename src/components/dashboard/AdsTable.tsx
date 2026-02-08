"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreHorizontal, MessageSquare, Calendar, TrendingUp, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Ad {
    id: string;
    title: string;
    price: number;
    currency: string;
    status: string;
    created_at: string;
    category?: string;
}

interface AdsTableProps {
    ads: Ad[];
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export function AdsTable({ ads, onDelete, onEdit }: AdsTableProps) {
    return (
        <div className="rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                            <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-zinc-400">Annonce</th>
                            <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-zinc-400">Statut</th>
                            <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-zinc-400">Prix</th>
                            <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-zinc-400">Date</th>
                            <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-zinc-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                        {ads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="max-w-xs mx-auto space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto text-zinc-300">
                                            <TrendingUp className="w-8 h-8" />
                                        </div>
                                        <p className="text-zinc-500 font-bold">Aucune annonce pour le moment.</p>
                                        <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">Commencez par en créer une !</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            ads.map((ad) => (
                                <tr key={ad.id} className="group hover:bg-zinc-50/70 transition-all dark:hover:bg-zinc-800/20">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 shadow-sm border border-white dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                                                {/* In a real app, show image here */}
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-zinc-900 dark:text-white mb-0.5 line-clamp-1 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                                                    {ad.title}
                                                </p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                    ID: #{ad.id.slice(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                            ad.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                ad.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                    'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                                        )}>
                                            {ad.status === 'approved' ? 'Approuvé' : ad.status === 'pending' ? 'En attente' : ad.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                                            {ad.price.toLocaleString()} <span className="text-[10px] text-zinc-400 ml-1">{ad.currency || 'MAD'}</span>
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
                                            <Calendar size={12} className="text-zinc-300" />
                                            {new Date(ad.created_at).toLocaleDateString("fr-FR")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/marketplace/${ad.id}`}>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-zinc-400 hover:text-orange-600 hover:bg-orange-50 transition-all">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="h-9 w-9 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all outline-none flex items-center justify-center">
                                                    <MoreHorizontal size={16} />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-48 rounded-2xl p-2 border-zinc-100 shadow-2xl">
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-3 py-2 text-sm font-bold cursor-pointer gap-3"
                                                        onClick={() => onEdit(ad.id)}
                                                    >
                                                        <Pencil size={14} className="text-zinc-400" /> Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-bold cursor-pointer gap-3">
                                                        <TrendingUp size={14} className="text-emerald-400" /> Booster l'annonce
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-1 bg-zinc-50" />
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(ad.id)}
                                                        className="rounded-xl px-3 py-2 text-sm font-bold cursor-pointer text-red-600 hover:bg-red-50 gap-3"
                                                    >
                                                        <Trash2 size={14} className="text-red-400" /> Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
