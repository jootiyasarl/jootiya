import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootNavbarShell } from "@/components/navbar/RootNavbarShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jootiya - الموقع الأول في المغرب للبيع والشراء",
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
    <html lang="fr" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootNavbarShell>{children}</RootNavbarShell>
      </body>
    </html>
  );
}
