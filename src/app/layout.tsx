import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import "./globals.css";
import { RootNavbarShell } from "@/components/navbar/RootNavbarShell";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["arabic", "latin"],
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

import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";
import { ServiceWorkerRegistration } from "@/components/notifications/ServiceWorkerRegistration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className="scroll-smooth">
      <body
        className={`${readexPro.variable} font-sans antialiased bg-white text-zinc-900`}
      >
        <ServiceWorkerRegistration />
        <RootNavbarShell>{children}</RootNavbarShell>
        <PushPermissionPrompt />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
