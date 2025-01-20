import apiClient from './apiClient';

import { GetPostulantesResponse, Postulante } from '@/types/types';

export const getPostulants = async (): Promise<Postulante[]> => {
  const response = await apiClient.get<GetPostulantesResponse>('/postulantes');
  return response.data.data;
};

export const getPostulantById = async (id: number): Promise<Postulante> => {
  const response = await apiClient.get<Postulante>(`/postulantes/${id}`);
  return response.data;
};

export const createPostulant = async (postulant: Omit<Postulante, 'id'>): Promise<Postulante> => {
  const response = await apiClient.post<Postulante>('/postulantes', postulant);
  return response.data;
};

export const updatePostulant = async (id: number, postulant: Partial<Postulante>): Promise<Postulante> => {
  const response = await apiClient.put<Postulante>(`/postulantes/${id}`, postulant);
  return response.data;
};

export const deletePostulant = async (id: number): Promise<void> => {
  await apiClient.delete(`/postulantes/${id}`);
};
