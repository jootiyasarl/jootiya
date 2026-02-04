"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreHorizontal, MessageSquare, Calendar } from "lucide-react";
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
    // ... existing code ...
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
                                        </div >
                                    </td >
                                </tr >
                            ))
                        )
}
                    </tbody >
                </table >
            </div >
        </div >
    );
}

// Ensure all sub-icons are imported correctly
import { TrendingUp, ShoppingBag } from "lucide-react";
