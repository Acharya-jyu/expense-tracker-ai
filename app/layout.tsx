import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { ExpenseProvider } from '@/context/ExpenseContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExpenseAI — Personal Finance Tracker',
  description: 'Track your expenses with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen antialiased`}>
        <ExpenseProvider>
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </ExpenseProvider>
      </body>
    </html>
  );
}
