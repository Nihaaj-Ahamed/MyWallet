import type { Metadata, Viewport } from 'next';
import './globals.css';
import { WalletProvider } from '../context/WalletContext';

export const metadata: Metadata = {
  title: 'MyWallet-MSNA',
  description: 'An ultra-premium, production-ready financial tracking web application with a mathematically perfect discrepancy reconciliation engine.',
  icons: {
    icon: './logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
