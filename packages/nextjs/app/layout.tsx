import type { Metadata } from 'next';
import { Providers } from './providers';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zameme - Confidential Fair Launch',
  description: 'Fair meme token launches with private contributions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-yellow-400">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

