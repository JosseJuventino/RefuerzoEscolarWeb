import { api } from '@/lib/api';

import { Grade, GradeResponse } from '@/types/types';

export const getGrades = async (): Promise<Grade[]> => {
  const response = await api.get<GradeResponse>('/grado');
  return response.data.data;
};
