import Link from "next/link";
import { Smartphone, Home, Car, Shirt, Club, Baby, Package, ArrowRight } from "lucide-react";

const CATEGORIES = [
    { id: "electronics", label: "إلكترونيات", icon: Smartphone, color: "bg-blue-100 text-blue-600", href: "/marketplace?category=electronics" },
    { id: "vehicles", label: "سيارات", icon: Car, color: "bg-orange-100 text-orange-600", href: "/marketplace?category=vehicles" },
    { id: "home", label: "منزل وأثاث", icon: Home, color: "bg-green-100 text-green-600", href: "/marketplace?category=home" },
    { id: "fashion", label: "أزياء", icon: Shirt, color: "bg-pink-100 text-pink-600", href: "/marketplace?category=fashion" },
    { id: "sports", label: "رياضة", icon: Club, color: "bg-purple-100 text-purple-600", href: "/marketplace?category=sports" },
    { id: "kids", label: "أطفال", icon: Baby, color: "bg-yellow-100 text-yellow-600", href: "/marketplace?category=kids" },
    { id: "other", label: "أخرى", icon: Package, color: "bg-zinc-100 text-zinc-600", href: "/marketplace?category=other" },
];

export function CategoryGrid() {
    return (
        <section className="py-16 bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">تصفح الأقسام</h2>
                    <Link href="/marketplace" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                        عرض الكل <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="group relative flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:-translate-y-1"
                        >
                            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${category.color} transition-transform group-hover:scale-110`}>
                                <category.icon className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-zinc-900 group-hover:text-blue-600">
                                {category.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
