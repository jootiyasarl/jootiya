"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarLogo() {
    const pathname = usePathname();
    const isHome = pathname === "/" || pathname === "/ar" || pathname === "/fr";

    const content = (
        <>
            JOOTIYA <span className="text-orange-500">.</span>
        </>
    );

    const classes = "text-xl md:text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white";

    return (
        <Link href="/" className="flex items-center shrink-0">
            {isHome ? (
                <h1 className={classes}>{content}</h1>
            ) : (
                <div className={classes}>{content}</div>
            )}
        </Link>
    );
}
