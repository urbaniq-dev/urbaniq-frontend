import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< Updated upstream
=======
import { SocketProvider } from "@/components/providers/SocketProvider";
>>>>>>> Stashed changes
import { AuthInitializer } from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Urbaniq | Premium Real Estate Platform",
  description: "Discover exceptional premium properties. Urbaniq connects buyers, owners, and agents on a curated real estate marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthInitializer />
<<<<<<< Updated upstream
        {children}
=======
        <SocketProvider>
          {children}
        </SocketProvider>
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
