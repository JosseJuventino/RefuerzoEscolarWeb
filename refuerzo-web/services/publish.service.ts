import { api } from '@/lib/api';

import { Publicacion } from '@/types/types';

export const addPublication = async (publicacion: Publicacion): Promise<Publicacion> => {
  const response = await api.post<Publicacion>('/publicacion', publicacion);
  return response.data;
};