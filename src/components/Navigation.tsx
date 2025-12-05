'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

// Dynamically import WalletMultiButton with SSR disabled to prevent hydration mismatch
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { 
    ssr: false,
    loading: () => (
      <div className="wallet-adapter-button wallet-adapter-button-trigger">
        <span className="wallet-adapter-button-start-icon"></span>
        Select Wallet
      </div>
    )
  }
);

export function Navigation() {
  const pathname = usePathname();
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Only render wallet-dependent UI after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between h-16" suppressHydrationWarning>
          <div className="flex" suppressHydrationWarning>
            <div className="flex-shrink-0 flex items-center" suppressHydrationWarning>
              <Link href="/" className="text-[#e50914] font-bold text-xl font-space-grotesk">
                True Seat
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/events"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-space-grotesk ${
                  pathname === '/events'
                    ? 'border-[#e50914] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Events
              </Link>
              {mounted && connected && (
                <Link
                  href="/owned"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-space-grotesk ${
                    pathname === '/owned'
                      ? 'border-[#e50914] text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  My Tickets
                </Link>
              )}
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-space-grotesk ${
                  pathname === '/about'
                    ? 'border-[#e50914] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-space-grotesk ${
                  pathname === '/contact'
                    ? 'border-[#e50914] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 