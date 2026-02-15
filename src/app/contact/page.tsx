import React from 'react';
import { Mail, Clock, MessageSquare } from 'lucide-react';

export const metadata = {
    title: 'Contactez-nous - Jootiya',
    description: 'Contactez-nous par e-mail ou via notre site web.',
};

export default function ContactUsPage() {
    return (
        <div className="bg-white min-h-screen" dir="ltr">
            {/* Minimal Premium Header */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.1" />
                        <path d="M0,50 L100,50" fill="none" stroke="white" strokeWidth="0.1" />
                    </svg>
                </div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Contactez-nous</h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Chez <span className="text-orange-500 font-bold">jootiya.com</span>, nous sommes toujours heureux d'entendre vos avis et questions. Notre équipe est prête à vous aider.
                    </p>
                    <div className="w-24 h-2 bg-orange-600 mx-auto mt-10 rounded-full shadow-lg shadow-orange-600/20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24 max-w-6xl animate-fade-in-up">
                <div className="grid lg:grid-cols-2 gap-20 items-stretch">
                    {/* Contact Information */}
                    <div className="space-y-12 text-left flex flex-col justify-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-zinc-900 border-l-8 border-orange-500 pl-6">Bienvenue dans notre monde</h2>
                            <p className="text-xl text-zinc-600 leading-relaxed font-medium">
                                Que vous ayez une question, une plainte ou une demande de publicité, nous sommes là pour assurer une expérience utilisateur inoubliable.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                                <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-1">Email Officiel</h3>
                                    <a href="mailto:contact@jootiya.com" className="text-zinc-600 hover:text-orange-600 transition-colors text-lg font-bold">
                                        contact@jootiya.com
                                    </a>
                                </div>
                            </div>

                            <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-1">Facebook</h3>
                                    <a href="https://facebook.com/jootiya" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-blue-600 transition-colors text-lg font-bold">
                                        @jootiya
                                    </a>
                                </div>
                            </div>

                            <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                                <div className="p-4 bg-pink-100 text-pink-600 rounded-2xl group-hover:bg-[#E4405F] group-hover:text-white transition-all">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-1">Instagram</h3>
                                    <a href="https://instagram.com/jootiya" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-pink-600 transition-colors text-lg font-bold">
                                        @jootiya
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Card / Design Element */}
                    <div className="relative h-full flex items-center">
                        <div className="absolute -inset-6 bg-gradient-to-tr from-orange-500 to-zinc-900 rounded-[4rem] blur-3xl opacity-10"></div>
                        <div className="relative w-full bg-white border border-zinc-100 p-12 md:p-16 rounded-[4rem] shadow-2xl flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-10 ring-8 ring-orange-50/50 animate-pulse">
                                <Mail size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-zinc-900 mb-6">Avez-vous une suggestion ?</h3>
                            <p className="text-zinc-500 text-lg mb-10 leading-relaxed font-medium">
                                Nous croyons que vos commentaires sont le secret de notre succès. N'hésitez pas à nous écrire en cliquant ci-dessous.
                            </p>
                            <a
                                href="mailto:contact@jootiya.com"
                                className="group flex items-center justify-center gap-4 w-full bg-zinc-900 text-white font-black py-6 rounded-3xl hover:bg-orange-600 transition-all shadow-2xl shadow-zinc-900/20 active:scale-95"
                            >
                                Envoyez-nous un message
                                <svg className="group-hover:translate-x-[8px] transition-transform" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </a>
                            <div className="mt-10 pt-8 border-t border-zinc-100 w-full">
                                <p className="text-sm text-zinc-400 font-medium italic">Nous respectons votre vie privée et ne partageons pas vos données.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24"></div>
        </div>
    );
}
