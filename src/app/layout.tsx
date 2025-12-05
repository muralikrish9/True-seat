import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'react-hot-toast';
import { ChatBot } from '@/components/ChatBot';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "True Seat - Decentralized Event Ticketing",
  description: "A blockchain-based platform for event ticketing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-gray-100" suppressHydrationWarning>
            {children}
          </div>
        </Providers>
        <Toaster position="top-right" />
        <ChatBot />
      </body>
    </html>
  );
}
