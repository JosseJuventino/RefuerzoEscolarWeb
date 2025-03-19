import { api } from "@/lib/api";

import {
  Asistencia,
  AsistenciaResponse,
  HistoryAsistenciaResponse,
} from "@/types/types";

export const getAllAsistencia = async (): Promise<Asistencia[]> => {
  const response = await api.get<AsistenciaResponse>("/asistencia");
  const data = response.data.data;
  return Array.isArray(data) ? data : [data];
};

export const getAsistenciaOfAlumnosBySectionId = async (
  id: string
): Promise<Asistencia> => {
  const response = await api.get<Asistencia>(`/asistencia/alumnos/${id}`);
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};

export const getAsistenciaOfEncargadosBySectionId = async (
  id: string
): Promise<Asistencia> => {
  const response = await api.get<Asistencia>(`/asistencia/encargados/${id}`);
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};

export const getRecordOfAlumno = async (id: string): Promise<Asistencia> => {
  const response = await api.get<Asistencia>(
    `/asistencia/alumno/register/${id}`
  );
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};

export const updateAsistenciaOfAlumno = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    `/asistencia/alumno/register/${asistencia._id}`,
    asistencia
  );
  return response.data;
};

export const addAlumnoAsistenciaBySectionId = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    "/asistencia/alumno/",
    asistencia
  );
  return response.data;
};

export const addEncargadoAsistenciaBySectionId = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    "/asistencia/encargado/",
    asistencia
  );
  return response.data;
};

export const getAsistenciaByCourseId = async (
  slug: string | undefined
): Promise<Asistencia> => {
  const response = await api.get<AsistenciaResponse>(
    `/asistencia/seccion/${slug}`
  );
  const data = response.data.data;
  return Array.isArray(data) ? data[0] : data;
};

export const updateAsistenciaById = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    `/asistencia/${asistencia._id}`,
    asistencia
  );
  return response.data;
};

export const getAsistenciaByDateAlumnos = async (
  id_section: string | undefined,
  month: string,
  year: string
): Promise<HistoryAsistenciaResponse> => {
  const response = await api.get<HistoryAsistenciaResponse>(
    `/asistencia/seccion/${id_section}/alumnos-agrupados?month=${month}&year=${year}`
  );
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
};
