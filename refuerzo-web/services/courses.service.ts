import { api } from "@/lib/api";

import { Course, CourseResponse } from "@/types/types";

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get<CourseResponse>("/seccion");
    const data = response.data.data;

    if (!data) {
      throw new Error("Datos no disponibles");
    }

    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const getCourseBySlug = async (slug: string): Promise<Course> => {
  const response = await api.get<CourseResponse>(`/seccion/slug/${slug}`);
  const data = response.data.data;
  return Array.isArray(data) ? data[0] : data;
};

export const updateCourse = async (
  course: Partial<Course>
): Promise<Course> => {
  const courseToUpdate: {
    encargados?: string[];
    backgroundImage?: string;
    nombre?: string;
  } = {};

  courseToUpdate.backgroundImage = course.backgroundImage;
  courseToUpdate.nombre = course.nombre;

  if (course.encargados) {
    courseToUpdate.encargados = course.encargados.map(
      (encargado) => encargado._id
    );
  }

  const response = await api.patch<Course>(
    `/seccion/${course._id}`,
    courseToUpdate
  );
  return response.data;
};

export const getMySections = async (): Promise<Course[]> => {
  const response = await api.get<CourseResponse>("/seccion/me");
  const data = response.data.data;
  return Array.isArray(data) ? data : [data];
};
