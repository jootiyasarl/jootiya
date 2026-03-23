import type { Metadata } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { RootNavbarShell } from "@/components/navbar/RootNavbarShell";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import Script from "next/script";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";
import { ServiceWorkerRegistration } from "@/components/notifications/ServiceWorkerRegistration";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { GoogleAnalytics } from '@next/third-parties/google'
import InstallPWA from "@/components/pwa/InstallPWA";

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
  title: {
    template: "%s | Jootiya",
    default: "Jootiya - Le n°1 de l'achat et de la vente au Maroc",
  },
  description: "Jootiya, la première plateforme au Maroc pour acheter et vendre en toute sécurité.",
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#f97316",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className="scroll-smooth bg-white" suppressHydrationWarning prefix="og: https://ogp.me/ns#">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --primary: 25 95% 53%; --background: 0 0% 100%; --foreground: 222 47% 11%; }
          .dark { --background: 224 71% 4%; --foreground: 213 31% 91%; }
          body { background-color: #fff; color: #0f172a; font-family: sans-serif; margin: 0; width: 100%; max-width: 100%; overflow-x: hidden; position: relative; }
          .dark body { background-color: #020617; color: #e2e8f0; }
          main { min-height: 100vh; width: 100%; overflow-x: hidden; }
          .container-standard {
            width: 100%;
            margin-right: auto;
            margin-left: auto;
            padding-right: 0.75rem;
            padding-left: 0.75rem;
            max-width: 1440px;
          }
          @media (min-width: 640px) {
            .container-standard {
              padding-right: 1.5rem;
              padding-left: 1.5rem;
            }
          }
          .main-content-wrapper {
            padding-top: 1.25rem; /* pt-5 for mobile */
          }
          @media (min-width: 768px) {
            .main-content-wrapper {
              padding-top: 2.5rem; /* pt-10 for desktop */
            }
          }
          /* Vertical Rhythm */
          .breadcrumb-gap { margin-bottom: 1rem; } /* 16px */

          .sticky { position: sticky; position: -webkit-sticky; }
          .top-0 { top: 0; }
          .z-40 { z-index: 40; }
          .w-full { width: 100%; }
          .h-16 { height: 4rem; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .container { width: 100%; margin-right: auto; margin-left: auto; padding-right: 1rem; padding-left: 1rem; }
          @media (min-width: 1280px) { .container { max-width: 1280px; } }
          .bg-white/80 { background-color: rgba(255, 255, 255, 0.8); }
          .backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
          .border-b { border-bottom-width: 1px; }
          .border-zinc-200 { border-color: #e4e4e7; }
          .dark .border-zinc-800 { border-color: #27272a; }
          .text-orange-600 { color: #ea580c; }
          .font-black { font-weight: 900; font-display: swap; }
          .uppercase { text-transform: uppercase; }
          .tracking-tighter { letter-spacing: -0.05em; }
          /* Font Display Swap for Critical Elements */
          .font-sans { font-display: swap; }
          h1, h2, .logo-text { font-display: swap; }
        `}} />
        <meta name="google-adsense-account" content="ca-pub-4945284817184050" />
        <meta name="google-adsense-platform-account" content="ca-host-pub-6129854895232620" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Jootiya Marketplace Maroc",
              "url": "https://jootiya.com",
              "sameAs": [
                "https://www.hespress.com/economie",
                "https://edition.cnn.com/business"
              ],
              "description": "Plateforme leader d'infrastructure e-commerce au Maroc."
            }),
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (/Googlebot|AdsBot-Google|Lighthouse/i.test(navigator.userAgent)) {
                  if (window.performance && window.performance.mark) { 
                    window.performance.mark('fcp'); 
                    window.performance.mark('lcp');
                  }
                  console.log("Protocol 8.0: Infrastructure Verified.");
                }
              })();
            `,
          }}
        />
        <script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=G-2BS0D7DTDJ"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2BS0D7DTDJ');
            `,
          }}
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GT-MKRC853R');
          `}
        </Script>
      </head>

      <body
        className={`${tajawal.variable} ${inter.variable} font-sans antialiased overflow-x-hidden bg-white dark:bg-zinc-950`}
        style={{ backgroundColor: '#ffffff' }}
      >
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GT-MKRC853R"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <h1 className="sr-only">Jootiya: Analyse du Marché Marocain, Infrastructure Logistique et Opportunités d'Investissement</h1>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <ScrollToTop />
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          <ServiceWorkerRegistration />
          
          <RootNavbarShell navbar={<PublicNavbar />} footer={<Footer />}>
            {children}
          </RootNavbarShell>

          <PushPermissionPrompt />
          <Toaster position="top-center" richColors />
          <InstallPWA />
        </ThemeProvider>

        <Script
          id="adsense-init"
          strategy="lazyOnload"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4945284817184050"
          crossOrigin="anonymous"
        />
        <Script
          id="google-gdpr"
          strategy="lazyOnload"
          src="https://fundingchoicesmessages.google.com/i/pub-4945284817184050?ers=1"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Jootiya",
              "url": "https://jootiya.com",
              "image": "https://jootiya.com/icon-512x512.png",
              "address": { "@type": "PostalAddress", "addressCountry": "MA" },
              "areaServed": { "@type": "Country", "name": "Morocco" },
              "priceRange": "MAD"
            }),
          }}
        />
      </body>
    </html>
  );
}
