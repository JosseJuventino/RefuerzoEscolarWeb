'use client';

import React from 'react';
import CourseNavbar from '@/components/Dashboard/CourseNavbar';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 1, name: 'Tablón', href: '/dashboard/courses/matematica1' },
  { id: 3, name: 'Personas', href: '/dashboard/courses/matematica1/personas' },
  { id: 4, name: 'Registrar asistencia', href: '/dashboard/courses/matematica1/asistencia' },
  { id: 5, name: 'Historial de asistencia', href: '/dashboard/courses/matematica1/historial' },
];

export default function Example1Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  
  const currentTabId = tabs.find((tab) => pathname === tab.href)?.id || 1;

  return (
    <div className="min-h-screen bg-gray-100">
      <CourseNavbar tabs={tabs} currentTabId={currentTabId} />
      
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:mt-16 mt-36">{children}</div>
      </main>
    </div>
  );
}
