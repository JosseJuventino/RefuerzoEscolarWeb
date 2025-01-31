import { api } from '@/lib/api';

import { Recomendadores, GetRecomendadoresResponse } from '@/types/types';

export const getRecomendadores = async (): Promise<Recomendadores[]> => {
  const response = await api.get<GetRecomendadoresResponse>('/users/recomendador');
  return response.data.data;
};

export const addRecomendador = async (recomendador: Recomendadores): Promise<Recomendadores> => {
  const response = await api.post<Recomendadores>('/users/recomendador', recomendador);
  return response.data;
};

export const updateRecomendador = async (recomendador: Recomendadores): Promise<Recomendadores> => {
  const response = await api.patch<Recomendadores>(`/users/recomendador/${recomendador._id}`, recomendador);
  return response.data;
}

export const deleteRecomendador = async (id: string): Promise<void> => {
  await api.delete(`/users/recomendadores/${id}`);
}
