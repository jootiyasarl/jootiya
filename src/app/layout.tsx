import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { RootNavbarShell } from "@/components/navbar/RootNavbarShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "جوتيا - الموقع الأول في المغرب للبيع والشراء",
  description:
    "جوتيا، المنصة الأولى في المغرب للبيع والشراء بكل أمان.",
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
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-white text-zinc-900`}
      >
        <RootNavbarShell>{children}</RootNavbarShell>
      </body>
    </html>
  );
}
