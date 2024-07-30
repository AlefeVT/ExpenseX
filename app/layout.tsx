import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import React from 'react';
import ThemaProvider from './_components/ThemaProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExpenseX',
  description: 'Sistema de gerenciamento de emprestimos',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="pt-br" className="overflow-y-hidden overflow-x-hidden">
        <body className={inter.className}>
          <ThemaProvider>
            <Toaster />
            {children}
          </ThemaProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
