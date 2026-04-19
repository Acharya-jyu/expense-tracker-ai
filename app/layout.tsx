import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { CustomCategoriesProvider } from '@/context/CustomCategoriesContext';
import AppShell from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExpenseAI — Personal Finance Tracker',
  description: 'Track your expenses with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen antialiased`}>
        <AuthProvider>
          <ExpenseProvider>
            <CustomCategoriesProvider>
              <AppShell>{children}</AppShell>
            </CustomCategoriesProvider>
          </ExpenseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
