import type { Metadata } from 'next';
import { NextUIProvider } from '@nextui-org/react';
import './globals.css';
import ClientProviders from '@/components/ClientProvider';
import { Toaster } from "@pheralb/toast";

export const metadata: Metadata = {
  title: 'Refuerzo Escolar Web',
  description: 'William Mendoza es un programa de refuerzo escolar especializado en matemáticas, diseñado para ayudar a los estudiantes a mejorar su comprensión y rendimiento académico. A través de clases personalizadas y ejercicios interactivos, esta plataforma online ofrece herramientas prácticas para dominar conceptos clave de matemáticas de manera efectiva. ¡Impulsa tu aprendizaje con William Mendoza y alcanza el éxito en tus estudios!',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
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
            <Toaster theme="light" />
          </ClientProviders>
        </NextUIProvider>
      </body>
    </html>
  );
}
