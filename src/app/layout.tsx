import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JotaiProvider from "./providers/JotaiProvider";
import SessionProvider from "./providers/SessionProvider";
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
  title: "Voiz.Report",
  description: "Voice-powered reporting made easy",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VoizReport",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1f2937",
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
          fontFamily: 'var(--font-geist-sans)',
          backgroundColor: '#f8fafc',
        }}
      >
        <SessionProvider>
          <JotaiProvider>
            <PWAInstaller />
            {children}
          </JotaiProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
