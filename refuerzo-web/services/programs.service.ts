import { api } from '@/lib/api';

import { Program, ProgramsResponse } from '@/types/types';

export const getPrograms = async (): Promise<Program[]> => {
  const response = await api.get<ProgramsResponse>('/programa');
  return response.data.data;
};
