import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-900 text-zinc-400 py-16 border-t border-zinc-800" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-orange-500 text-3xl">J</span>ootiya
                        </Link>
                        <p className="text-zinc-500 leading-relaxed">
                            المنصة رقم 1 في المغرب لبيع وشراء كل ما يخطر ببالك. سهولة، أمان، وسرعة في مكان واحد.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all duration-300">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-white text-lg font-bold">روابط سريعة</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" className="hover:text-orange-500 transition-colors">من نحن</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-orange-500 transition-colors">اتصل بنا</Link>
                            </li>
                            <li>
                                <Link href="/marketplace" className="hover:text-orange-500 transition-colors">السوق</Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-orange-500 transition-colors">لوحة التحكم</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Pages */}
                    <div className="space-y-6">
                        <h3 className="text-white text-lg font-bold">قانوني</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy-policy" className="hover:text-orange-500 transition-colors">سياسة الخصوصية</Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-orange-500 transition-colors">اتفاقية الاستخدام</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-white text-lg font-bold">تواصل معنا</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="text-orange-500"><Mail size={18} /></div>
                                <a href="mailto:contact@jootiya.com" className="hover:text-orange-500 transition-colors">contact@jootiya.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="text-orange-500"><Phone size={18} /></div>
                                <span dir="ltr">+212 000-000000</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="text-orange-500"><MapPin size={18} /></div>
                                <span>الدار البيضاء، المغرب</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-zinc-800 text-center md:flex md:justify-between md:items-center">
                    <p className="text-zinc-600 text-sm">
                        © {currentYear} <span className="text-white font-medium">Jootiya.com</span>. جميع الحقوق محفوظة.
                    </p>
                    <div className="mt-4 md:mt-0 flex justify-center gap-6">
                        {/* Payment Methods Icons or similar */}
                        <div className="w-12 h-8 bg-zinc-800 rounded opacity-50"></div>
                        <div className="w-12 h-8 bg-zinc-800 rounded opacity-50"></div>
                        <div className="w-12 h-8 bg-zinc-800 rounded opacity-50"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
