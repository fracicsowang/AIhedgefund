import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientAuthProvider from '@/components/ClientAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Hedge Fund - Smart Investment Advisor',
  description: 'AI-powered intelligent investment advisor system, providing comprehensive trading recommendations from multiple investment masters',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
} 