import { api } from "@/lib/api";

import { Tutor, TutorResponse } from "@/types/types";

export const getTutors = async (): Promise<Tutor[]> => {
  const response = await api.get<TutorResponse>("/tutores/pagination");
  return response.data.data;
};

export const addTutor = async (
  recomendador: Tutor
): Promise<Partial<Tutor>> => {
  const response = await api.post<Partial<Tutor>>("/tutores", recomendador);
  return response.data;
};

export const deleteTutor = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
