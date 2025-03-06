export const ROLES = {
  ADMIN: "admin",
  RECOMENDADOR: "recomendador",
  ALUMNO: "alumno",
  TUTOR: "tutor",
  PROFESOR: "profesor",
} as const;

export type RoleKeys = keyof typeof ROLES;
export type RoleValues = (typeof ROLES)[RoleKeys];
