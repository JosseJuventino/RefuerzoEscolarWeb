import { api } from '@/lib/api';

import { Estudiante, GetEstudiantesResponse } from '@/types/types';

export const getAlumnos = async (): Promise<Estudiante[]> => {
  const response = await api.get<GetEstudiantesResponse>('/alumno');
  return response.data.data;
};

export const deleteAlumno = async (id: string): Promise<void> => {
  await api.delete(`/alumno/${id}`);
}

export const updateAlumno = async (alumno: Partial<Estudiante>): Promise<Partial<Estudiante>> => {
  const response = await api.patch< Partial<Estudiante>>(`/alumno/${alumno._id}`, alumno);
  return response.data;
}
