import type { Metadata } from "next";
import "./globals.css";
// import { RootNavbarShell } from "@/components/navbar/RootNavbarShell"; // Commenting out for now as I need to verify it exists or create it

export const metadata: Metadata = {
  title: "Jootiya.com | Marketplace",
  description: "Buy and sell used goods in Morocco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
