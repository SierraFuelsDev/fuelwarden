import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Navigation } from "../components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FuelWarden - Smart Nutrition Tracking",
  description: "Track your meals, plan your nutrition, and achieve your health goals with FuelWarden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1c1c1e] text-white`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen pt-16 pb-16 md:pb-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
