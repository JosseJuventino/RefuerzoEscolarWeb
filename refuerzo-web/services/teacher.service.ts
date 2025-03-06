import { api } from '@/lib/api';

import { Teacher, TeacherResponse } from '@/types/types'

export const getTeacher = async (): Promise<Teacher[]> => {
  const response = await api.get<TeacherResponse>('/profesor/pagination');
  return response.data.data;
};

export const addTeacher = async (teacher: Teacher): Promise<Partial<Teacher>> => {
  const response = await api.post<Partial<Teacher>>('/profesor', teacher);
  return response.data;
};

export const deleteTeacher = async (id: string): Promise<void> => {
    await api.delete(`/profesor/${id}`);
}