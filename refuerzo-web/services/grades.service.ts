import { api } from '@/lib/api';

import { Grade, GradeResponse, PartialGrade } from '@/types/types';

export const getGrades = async (): Promise<Grade[]> => {
  const response = await api.get<GradeResponse>('/grado');
  return response.data.data;
};

export const addGrade = async (grade: PartialGrade): Promise<PartialGrade> => {
  const response = await api.post<Grade>('/grado', grade);
  return response.data;
};

export const deleteGrade = async (id: string): Promise<void> => {
  await api.delete(`/grado/${id}`);
};

export const updateGrade = async (grade: Grade): Promise<Grade> => {
  const response = await api.patch<Grade>(`/grado/${grade._id}`, grade);
  return response.data;
};


