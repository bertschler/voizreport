import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JotaiProvider from "./providers/JotaiProvider";

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
          minHeight: '100vh'
        }}
      >
        <JotaiProvider>
          {children}
        </JotaiProvider>
      </body>
    </html>
  );
}
