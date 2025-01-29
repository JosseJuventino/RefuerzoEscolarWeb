import { api } from '@/lib/api';
import { GetPostulantesResponse, Postulante } from '@/types/types';

export const getPostulants = async (): Promise<Postulante[]> => {
  const response = await api.get<GetPostulantesResponse>('/postulantes');
  return response.data.data;
};