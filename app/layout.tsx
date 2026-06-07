import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "生活計劃 Plan of Life",
  description: "A Catholic plan of life for prayer, sacraments, and daily holiness.",
  applicationName: "生活計劃 Plan of Life",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "生活計劃 Plan of Life",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#58CC02",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
