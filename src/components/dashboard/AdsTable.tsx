"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Ensure this exists or I'll create it
import { Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Ad {
    id: string;
    title: string;
    price: number;
    currency: string;
    status: string;
    created_at: string;
}

interface AdsTableProps {
    ads: Ad[];
    onDelete: (id: string) => void;
}

export function AdsTable({ ads, onDelete }: AdsTableProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 dark:bg-zinc-800/50 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Created At</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {ads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No ads found. Start selling today!
                                </td>
                            </tr>
                        ) : (
                            ads.map((ad) => (
                                <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {ad.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {ad.currency} {ad.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${ad.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                            {ad.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(ad.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/marketplace/${ad.id}`}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {/* In a real app, Edit would link to an edit page */}
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-green-600">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                                onClick={() => onDelete(ad.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
