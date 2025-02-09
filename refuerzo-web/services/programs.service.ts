import { api } from '@/lib/api';

import { Program, ProgramsResponse, PartialProgram } from '@/types/types';

export const getPrograms = async (): Promise<Program[]> => {
  const response = await api.get<ProgramsResponse>('/programa');
  return response.data.data;
};

export const addProgram = async (programa: PartialProgram): Promise<PartialProgram> => {
  const response = await api.post<Program>('/programa', programa);
  return response.data;
};

export const deleteProgram = async (id: string): Promise<void> => {
  await api.delete(`/programa/${id}`);
}

export const updateProgram = async (programa: Program): Promise<Program> => {
  const response = await api.patch<Program>(`/programa/${programa._id}`, programa);
  return response.data;
}
