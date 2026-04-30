import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acts of Piety",
  description: "A joyful Catholic habit and prayer app.",
  applicationName: "Acts of Piety",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Acts of Piety",
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
