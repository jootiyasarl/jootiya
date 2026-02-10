import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs md:text-sm text-zinc-500 overflow-x-auto no-scrollbar py-2", className)}>
            <ol className="flex items-center space-x-1 md:space-x-2 shrink-0">
                <li className="flex items-center">
                    <Link
                        href="/"
                        className="hover:text-orange-600 transition-colors flex items-center"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-1 text-zinc-300 shrink-0" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-orange-600 transition-colors whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-semibold text-zinc-900 whitespace-nowrap">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
