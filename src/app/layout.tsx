import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  title: "MeuTreino App · M&K Fitness Center",
  description: "Seu treino na palma da mão — exclusivo para alunas da M&K Fitness Center",
  manifest: "/manifest.json",
  themeColor: "#D4537E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MeuTreino M&K",
  },
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
        {children}
      </body>
    </html>
  );
}