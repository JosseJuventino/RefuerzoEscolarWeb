'use client';

import React from 'react';
import CourseNavbar from '@/components/Dashboard/CourseNavbar';
import { useParams, usePathname } from 'next/navigation';

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();

  const slug = params.slug as string;

  const tabs = [
    { id: 1, name: 'Tablón', href: `/dashboard/my-courses/${slug}` },
    { id: 3, name: 'Personas', href: `/dashboard/my-courses/${slug}/personas` },
    { id: 4, name: 'Registrar asistencia', href: `/dashboard/my-courses/${slug}/asistencia` },
    { id: 5, name: 'Historial de asistencia', href: `/dashboard/my-courses/${slug}/historial` },
  ];

  const currentTabId = tabs.find((tab) => pathname === tab.href)?.id || 1;

  return (
    <div className="min-h-screen bg-gray-100">
      <CourseNavbar tabs={tabs} currentTabId={currentTabId} />
      
      <main className="py-6">
        <div className="sm:px-6 lg:px-8 md:mt-16 mt-36">{children}</div>
      </main>
    </div>
  );
}