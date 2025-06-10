import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JotaiProvider from "./providers/JotaiProvider";
import PWAInstaller from "../components/PWAInstaller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoizReport",
  description: "Voice-powered reporting made easy",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VoizReport",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'var(--font-geist-sans)',
          backgroundColor: '#f8fafc',
          height: '100svh' // Small viewport height - always fits visible area on mobile
        }}
      >
        <JotaiProvider>
          <PWAInstaller />
          {children}
        </JotaiProvider>
      </body>
    </html>
  );
}
