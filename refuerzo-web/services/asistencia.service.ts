import { api } from "@/lib/api";

import {
  Asistencia,
  AsistenciaAlumno,
  AsistenciaEncargado,
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
  const response = await api.post<Asistencia>(
    `/asistencia/alumno/${asistencia.seccionId}`,
    asistencia
  );
  return response.data;
};

export const getAsistenciaByDateAlumnos = async (
  id_section: string | undefined,
  month: string,
  year: string
): Promise<HistoryAsistenciaResponse<AsistenciaAlumno>> => {
  const response = await api.get<HistoryAsistenciaResponse<AsistenciaAlumno>>(
    `/asistencia/seccion/${id_section}/alumnos-agrupados?month=${month}&year=${year}`
  );
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const getAsistenciaByDateEncargados = async (
  id_section: string | undefined,
  month: string,
  year: string
): Promise<HistoryAsistenciaResponse<AsistenciaEncargado>> => {
  const response = await api.get<HistoryAsistenciaResponse<AsistenciaEncargado>>(
    `/asistencia/seccion/${id_section}/encargados-agrupados?month=${month}&year=${year}`
  );

  console.log("Response nueva", response);
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const addAsistenciaEncargadoIndividualy = async (
  encargado: Partial<AsistenciaEncargado>,
  id_section: string
): Promise<Asistencia> => {
  const response = await api.post<Asistencia>(
    `/asistencia/encargado/${id_section}`,
    encargado
  );
  return response.data;
};

export const updateRegisterById = async (
  asistencia: Partial<Asistencia>
): Promise<Asistencia> => {
  const response = await api.patch<Asistencia>(
    `/asistencia/alumno/register/${asistencia._id}`,
    asistencia
  );
  return response.data;
};
