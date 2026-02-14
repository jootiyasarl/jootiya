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
  verification: {
    google: "_BPJsUrFkTt42U-_XHVC0kBXAF2b9xpoT8RaX9BxU0Y",
  },
  alternates: {
    canonical: "https://jootiya.com",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
    <html lang="fr" dir="ltr" className="scroll-smooth bg-white" suppressHydrationWarning prefix="og: https://ogp.me/ns#">
      <body
        className={`${tajawal.variable} ${inter.variable} font-sans antialiased overflow-x-hidden bg-white dark:bg-zinc-950`}
        style={{ backgroundColor: '#ffffff' }}
      >
        <h1 className="sr-only">سوق المغرب المفتوح: همزات، أوقات الصلاة، وأخبار السوق في المغرب</h1>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "LocalBusiness"],
              "name": "Jootiya",
              "url": "https://jootiya.com",
              "logo": "https://jootiya.com/favicon.svg",
              "image": "https://jootiya.com/icon-512x512.png",
              "description": "Jootiya هو دليلك في المغرب لمعرفة آخر الهمزات وتوقيت المدن المغربية. السوق الأول لبيع وشراء المنتجات المستعملة والجديدة.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "31.7917",
                "longitude": "-7.0926"
              },
              "areaServed": {
                "@type": "Country",
                "name": "المغرب",
                "alternateName": "Morocco"
              },
              "hasMap": "https://jootiya.com/marketplace",
              "priceRange": "MAD"
            })
          }}
        />
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
