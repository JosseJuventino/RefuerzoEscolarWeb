// app/layout.tsx (Server Component por defecto)
import type { Metadata } from 'next';
import { NextUIProvider } from '@nextui-org/react';
import './globals.css';

import ClientProviders from './ClientProvider';

export const metadata: Metadata = {
  title: 'Refuerzo Escolar Web',
  description: '',
  icons: {
    icon: '/favicon.ico', 
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextUIProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </NextUIProvider>
      </body>
    </html>
  );
}
