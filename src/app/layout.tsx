import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBar from "@/components/nav";
import { LanguageProvider } from "@/lib/language-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Energy Calculator | Smart Home Power Management",
  description: "Calculate your household energy consumption and get personalized saving tips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          <div className="relative min-h-screen">
            {/* Ambient background effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-amber-500/10 via-transparent to-transparent blur-3xl" />
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-orange-500/10 via-transparent to-transparent blur-3xl" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.015]" />
            </div>
            <NavBar />
            <main className="relative">
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
