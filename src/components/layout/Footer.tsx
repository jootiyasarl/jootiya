"use client"

import React from 'react';
import Link from 'next/link';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    Send,
    ShieldCheck,
    Zap,
    Globe
} from 'lucide-react';

const POPULAR_CATEGORIES = [
    { id: "electronics", label: "Électronique" },
    { id: "home-furniture", label: "Maison & Ameublement" },
    { id: "vehicles", label: "Véhicules" },
    { id: "fashion", label: "Mode" },
    { id: "tools-equipment", label: "Outils & Équipement" },
    { id: "hobbies", label: "Loisirs" },
];

const MAJOR_CITIES = [
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Tanger",
    "Agadir",
    "Fès",
];

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [prayerTimes, setPrayerTimes] = React.useState<{ [key: string]: string }>({
        'الفجر': '--:--',
        'الظهر': '--:--',
        'العصر': '--:--',
        'المغرب': '--:--',
        'العشاء': '--:--'
    });

    React.useEffect(() => {
        const fetchPrayers = async () => {
            try {
                // Fetch for Casablanca as default Moroccan reference
                const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Casablanca&country=Morocco&method=3');
                const data = await res.json();
                if (data.data && data.data.timings) {
                    const t = data.data.timings;
                    setPrayerTimes({
                        'الفجر': t.Fajr,
                        'الظهر': t.Dhuhr,
                        'العصر': t.Asr,
                        'المغرب': t.Maghrib,
                        'العشاء': t.Isha
                    });
                }
            } catch (err) {
                console.error('Prayer API Error:', err);
            }
        };
        fetchPrayers();
    }, []);

    return (
        <footer className="bg-[#0b0f1a] text-zinc-400 pt-20 pb-20 border-t border-zinc-800/50" dir="ltr">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

                    {/* Column 1: Brand & Bio */}
                    <div className="lg:col-span-1 space-y-6">
                        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                            <span className="text-2xl font-black tracking-tighter text-white">
                                JOOTIYA<span className="text-orange-500">.</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-zinc-500 max-w-xs">
                            La plateforme n°1 au Maroc pour l'achat et la vente d'occasion. Nous connectons des milliers d'acheteurs et de vendeurs chaque jour dans un environnement sécurisé.
                        </p>
                        <div className="flex items-center gap-3">
                            <SocialLink href="https://facebook.com/jootiya" icon={<Facebook size={18} />} color="hover:text-[#1877F2]" />
                            <SocialLink href="https://instagram.com/jootiya" icon={<Instagram size={18} />} color="hover:text-[#E4405F]" />
                            <SocialLink href="https://x.com/jootiya" icon={<Twitter size={18} />} color="hover:text-[#1DA1F2]" />
                        </div>
                    </div>

                    {/* Column 2: SEO Categories */}
                    <div className="space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-orange-500" />
                            Catégories Populaires
                        </h4>
                        <ul className="space-y-3">
                            {POPULAR_CATEGORIES.map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/categories/${cat.id}`}
                                        className="text-[13px] font-medium hover:text-orange-500 transition-colors flex items-center group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-zinc-700 mr-2 group-hover:bg-orange-500 transition-colors" />
                                        {cat.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: SEO Cities */}
                    <div className="space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            Villes Principales
                        </h4>
                        <ul className="space-y-3">
                            {MAJOR_CITIES.map((city) => (
                                <li key={city}>
                                    <Link
                                        href={`/cities/${city.toLowerCase()}`}
                                        className="text-[13px] font-medium hover:text-orange-500 transition-colors flex items-center group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-zinc-700 mr-2 group-hover:bg-orange-500 transition-colors" />
                                        {city}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Links & Support */}
                    <div className="space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-orange-500" />
                            Aide & Légal
                        </h4>
                        <ul className="space-y-3">
                            <FooterLink href="/about" rel="nofollow">Notre Concept</FooterLink>
                            <FooterLink href="/safety" rel="nofollow">Conseils de Sécurité</FooterLink>
                            <FooterLink href="/terms" rel="nofollow">CGU & Conditions</FooterLink>
                            <FooterLink href="/privacy-policy" rel="nofollow">Confidentialité</FooterLink>
                            <FooterLink href="/help" rel="nofollow">Support Client</FooterLink>
                        </ul>
                    </div>

                    {/* Column 5: Newsletter & Contact */}
                    <div className="lg:col-span-1 space-y-6">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3 h-3 text-orange-500" />
                            Newsletter
                        </h4>
                        <div className="space-y-4">
                            <p className="text-[12px] text-zinc-500 font-medium italic">
                                Recevez les meilleures offres de votre ville.
                            </p>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Votre email..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all text-white pr-12"
                                />
                                <button className="absolute right-1 top-1 bottom-1 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center">
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <Globe size={14} className="text-orange-500" />
                                <span>www.jootiya.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Links Cloud - Morocco Strategy */}
                <div className="pt-10 border-t border-zinc-800/50">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3" dir="rtl">
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">جميع إعلانات المغرب</Link>
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">همزة اليوم في المغرب</Link>
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">سوق المغرب المفتوح</Link>
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">بيع واشري في المغرب</Link>
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">إعلانات مبوبة المغرب</Link>
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">جوتيا المغرب</Link>
                        <Link href="/marketplace" className="text-[11px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">أفضل عروض المغرب</Link>
                    </div>
                </div>

                {/* Semantic SEO Widgets: Prayer & Weather */}
                <div className="pt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 border-t border-zinc-800/20 mt-10">
                    <div className="bg-white/5 rounded-[2rem] p-5 md:p-8 border border-white/10 text-right" dir="rtl">
                        <h4 className="text-white text-sm font-black mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            مواقيت الصلاة وأخبار السوق
                        </h4>
                        <p className="text-[11px] md:text-xs text-zinc-500 mb-6 leading-relaxed">
                            تابع أوقات الصلاة في <Link href="/marketplace?city=Casablanca" className="text-zinc-300 hover:text-orange-500 underline underline-offset-4 decoration-zinc-700">الدار البيضاء</Link>، <Link href="/marketplace?city=Marrakech" className="text-zinc-300 hover:text-orange-500 underline underline-offset-4 decoration-zinc-700">مراكش</Link>، و<Link href="/marketplace?city=Rabat" className="text-zinc-300 hover:text-orange-500 underline underline-offset-4 decoration-zinc-700">الرباط</Link>. Jootiya هو دليلك في المغرب لمعرفة آخر الهمزات وتوقيت المدن المغربية.
                        </p>
                        <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar snap-x">
                            {Object.entries(prayerTimes).map(([name, time]) => (
                                <div key={name} className="flex-shrink-0 bg-black/40 px-4 py-3 rounded-2xl border border-white/5 text-center min-w-[85px] snap-center">
                                    <span className="block text-[10px] text-zinc-500 font-bold mb-1">{name}</span>
                                    <span className="block text-sm text-orange-500 font-black tracking-tight">{time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-[2rem] p-5 md:p-8 border border-white/10 text-right" dir="rtl">
                        <h4 className="text-white text-sm font-black mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            حالة الطقس في المغرب
                        </h4>
                        <p className="text-[11px] md:text-xs text-zinc-500 mb-6 leading-relaxed">
                            تعرف على حالة الطقس اليوم قبل خروجك للتسوق في <Link href="/marketplace?city=Tanger" className="text-zinc-300 hover:text-orange-500 underline underline-offset-4 decoration-zinc-700">طنجة</Link>، <Link href="/marketplace?city=Agadir" className="text-zinc-300 hover:text-orange-500 underline underline-offset-4 decoration-zinc-700">أكادير</Link>، و<Link href="/marketplace?city=Fes" className="text-zinc-300 hover:text-orange-500 underline underline-offset-4 decoration-zinc-700">فاس</Link>.
                        </p>
                        <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter drop-shadow-md">☀️</span>
                                <div className="text-right">
                                    <span className="block text-sm text-white font-black">مشمس غالباً</span>
                                    <span className="block text-[10px] text-zinc-500 font-bold mt-0.5 uppercase tracking-wider">تحديث مباشر</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-orange-500 tracking-tighter">22°C</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar Section */}
                <div className="pt-10 border-t border-zinc-800/50 space-y-12">
                    {/* SEO Content Injection - French Professional Version */}
                    <div className="grid md:grid-cols-2 gap-12 items-start text-left" dir="ltr">
                        <div className="space-y-4">
                            <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tighter">
                                Jootiya : La Marketplace n°1 pour l'Achat et la Vente au Maroc
                            </h2>
                            <p className="text-sm leading-relaxed text-zinc-500 font-medium">
                                Vous cherchez la meilleure affaire à Marrakech, Casablanca ou Tanger ? Jootiya est votre destination privilégiée pour acheter et vendre smartphones, voitures, et immobilier en toute sécurité.
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <li className="flex items-center gap-3 text-zinc-400 text-[13px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                    Marché Ouvert au Maroc
                                </li>
                                <li className="flex items-center gap-3 text-zinc-400 text-[13px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                    Vente Rapide & Gratuite
                                </li>
                                <li className="flex items-center gap-3 text-zinc-400 text-[13px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                    Contact Direct via WhatsApp
                                </li>
                                <li className="flex items-center gap-3 text-zinc-400 text-[13px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                    Transactions Sécurisées
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tighter">
                                Des milliers de catégories : Électronique, Véhicules & Immobilier
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500 font-medium">
                                Rejoignez des milliers d'utilisateurs quotidiens sur la plus grande plateforme de commerce libre au Maroc. Nous vous offrons les outils nécessaires pour propulser vos ventes et atteindre des clients dans toutes les villes du Royaume.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-8 border-t border-zinc-800/20">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-medium text-zinc-100">
                            <p>© {currentYear} JOOTIYA. Tous droits réservés.</p>
                            <span className="hidden md:block w-1 h-1 rounded-full bg-zinc-700" />
                            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
                                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] font-bold text-white leading-none">M</div>
                                <span>Fait au Maroc avec ❤️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, color }: { href: string; icon: React.ReactNode; color: string }) {
    return (
        <a
            href={href}
            rel="nofollow"
            className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 transition-all duration-300 ${color} hover:bg-white/10 hover:translate-y-[-2px]`}
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children, rel }: { href: string; children: React.ReactNode; rel?: string }) {
    return (
        <li>
            <Link
                href={href}
                rel={rel}
                className="text-[13px] font-medium hover:text-white transition-colors flex items-center group"
            >
                {children}
            </Link>
        </li>
    );
}
