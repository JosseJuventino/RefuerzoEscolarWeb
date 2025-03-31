'use client';

import React from 'react';
import CourseNavbar from '@/components/Dashboard/CourseNavbar';
import { useParams, usePathname } from 'next/navigation';
import { getCourseBySlug } from '@/services/courses.service';
import { Course } from '@/types/types';
import { Loading } from '@/components/Loading';
import { useQuery } from '@tanstack/react-query';
import { CourseContext } from '@/app/contexts/course-context';
import { ROLES } from "@/app/constants/roles";
import { useAuth } from '@/hooks/useAuth';

//Este contexto se ha creado para poder compartir los datos del curso por las diferentes tabs y 
// asi no tener que hacer peticiones a la API en cada tab.

export default function CourseLayout({ children }: { children: React.ReactNode }) {

  const { slug } = useParams();

  const pathname = usePathname();

  const {
    data: course,
    isLoading,
    isError,
    error
  } = useQuery<Course>({
    queryKey: ['course', slug],
    queryFn: () => getCourseBySlug(slug as string),
  });



  // Assuming you have a hook or context to get the current user’s role

  const { user } = useAuth();

  const tabs = [
    { id: 1, name: 'Tablón', href: `/dashboard/my-courses/${slug}` },
    { id: 3, name: 'Personas', href: `/dashboard/my-courses/${slug}/personas` },
  ];

  // Only include "Registrar asistencia" and "Historial de asistencia" if the user has the right role
  if (user && [ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR].includes(user.role as "admin" | "profesor" | "tutor")) {
    tabs.push(
      { id: 4, name: 'Registrar asistencia', href: `/dashboard/my-courses/${slug}/asistencia` },
      { id: 5, name: 'Historial de asistencia', href: `/dashboard/my-courses/${slug}/historial` },
    );
  }

  const currentTabId = tabs.find((tab) => pathname === tab.href)?.id || 1;

  if (isLoading) return <Loading />;

  if (isError) return <div className="text-center py-8 text-red-500">Error: {error?.message}</div>;

  return (
    <CourseContext.Provider value={course} >
      <div className="min-h-screen bg-gray-100">
        <CourseNavbar tabs={tabs} currentTabId={currentTabId} />

        <main className="py-6">
          <div className="sm:px-6 lg:px-8 md:mt-16 mt-14">{children}</div>
        </main>
      </div>
    </CourseContext.Provider>
  );
}