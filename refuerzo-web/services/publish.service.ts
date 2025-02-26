import { api } from '@/lib/api';

import { Publicacion } from '@/types/types';

export const addPublication = async (publicacion: Partial<Publicacion>): Promise<Partial<Publicacion>> => {
  const response = await api.post<Partial<Publicacion>>('/publicacion', publicacion);
  return response.data;
};