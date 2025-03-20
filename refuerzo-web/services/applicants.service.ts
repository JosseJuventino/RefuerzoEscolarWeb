import { api } from "@/lib/api";
import {
  GetPostulantesResponse,
  PartialPostulant,
  CompletePostulant,
} from "@/types/types";

export const getPostulants = async (): Promise<CompletePostulant[]> => {
  const response = await api.get<GetPostulantesResponse>("/postulantes");
  return response.data.data;
};

export const deletePostulant = async (id: string): Promise<void> => {
  await api.delete(`/postulantes/${id}`);
};

export const addPostulante = async (
  postulante: PartialPostulant
): Promise<PartialPostulant> => {
  const response = await api.post<PartialPostulant>("/postulantes", postulante);
  console.log(response);
  return response.data;
};
