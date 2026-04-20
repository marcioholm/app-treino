import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PushNotificationsSetup from "@/components/PushNotificationsSetup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#D4537E",
};

export const metadata: Metadata = {
  title: "M&K Fitness Center",
  description: "Seu espaço seguro para treinar e se cuidar. Uma comunidade de mulher para mulher.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "M&K Fitness",
  },
  icons: {
    apple: "/favicon.png",
    icon: "/favicon.png",
    shortcut: "/favicon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PushNotificationsSetup />
        {children}
      </body>
    </html>
  );
}