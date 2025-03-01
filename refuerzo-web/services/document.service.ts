import { api } from '@/lib/api';

import { FileNew } from '@/types/types';

export const uploadDocument = async (documento: Partial<FileNew>): Promise<Partial<FileNew>> => {
  const formData = new FormData();

  if (documento.originalFileName !== undefined) {
    formData.append('originalFilename', documento.originalFileName);
  }
  if (documento.category !== undefined) {
    formData.append('category', documento.category);
  }
  if (documento.file !== undefined) {
    formData.append('file', documento.file);
  }

  const response = await api.post<Partial<FileNew>>(
    '/documents',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};