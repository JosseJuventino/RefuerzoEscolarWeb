"use client";

import { RoleValues, ROLES } from "@/app/constants/roles";
import { useSession } from "next-auth/react";

export const useRole = () => {
  const { data: session } = useSession();

  const hasRole = (allowedRoles: RoleValues[]) => {
    return allowedRoles.includes(session?.user?.role as RoleValues);
  };

  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const isRecomendador = session?.user?.role === ROLES.RECOMENDADOR;
  const isAlumno = session?.user?.role === ROLES.ALUMNO;
  const isTutor = session?.user?.role === ROLES.TUTOR;
  const isProfesor = session?.user?.role === ROLES.PROFESOR;

  return {
    hasRole,
    isAdmin,
    isRecomendador,
    isAlumno,
    isTutor,
    isProfesor,
    role: session?.user?.role,
  };
};
