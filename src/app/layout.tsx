import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { RootNavbarShell } from "@/components/navbar/RootNavbarShell";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Jootiya - Le n°1 de l'achat et de la vente au Maroc",
  description:
    "Jootiya, la première plateforme au Maroc pour acheter et vendre en toute sécurité.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className="scroll-smooth">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-white text-zinc-900`}
      >
        <RootNavbarShell>{children}</RootNavbarShell>
        <Footer />
      </body>
    </html>
  );
}
