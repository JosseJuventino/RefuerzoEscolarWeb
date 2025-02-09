import { api } from '@/lib/api';

import { Estudiante, GetEstudiantesResponse } from '@/types/types';

export const getAlumnos = async (): Promise<Estudiante[]> => {
  const response = await api.get<GetEstudiantesResponse>('/alumno');
  return response.data.data;
};