import type { Metadata } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { RootNavbarShell } from "@/components/navbar/RootNavbarShell";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Jootiya - Le n°1 de l'achat et de la vente au Maroc",
  description:
    "Jootiya, la première plateforme au Maroc pour acheter et vendre en toute sécurité.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jootiya",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";
import { ServiceWorkerRegistration } from "@/components/notifications/ServiceWorkerRegistration";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Suspense } from "react";

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} ${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          <ServiceWorkerRegistration />
          <RootNavbarShell
            navbar={<PublicNavbar />}
            footer={<Footer />}
          >
            <PageTransition>
              {children}
            </PageTransition>
          </RootNavbarShell>
          <PushPermissionPrompt />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
