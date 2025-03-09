import { api } from '@/lib/api';

import { Course, CourseResponse } from '@/types/types';

export const getCourses = async (): Promise<Course[]> => {
    const response = await api.get<CourseResponse>('/seccion');
    const data = response.data.data;
    return Array.isArray(data) ? data : [data];
};

export const getCourseBySlug = async (slug: string): Promise<Course> => {
    const response = await api.get<CourseResponse>(`/seccion/slug/${slug}`);
    const data = response.data.data;
    return Array.isArray(data) ? data[0] : data;
} 

export const updateCourse = async (course: Partial<Course>): Promise<Course> => {
    const courseToUpdate: { encargados?: string[], imagen?: string, nombre?: string } = {};
    
    courseToUpdate.imagen = course.backgroundImage;
    courseToUpdate.nombre = course.nombre;
    
    if (course.encargados) {
        courseToUpdate.encargados = course.encargados.map((encargado) => encargado._id);
    }
    
    const response = await api.patch<Course>(`/seccion/${course._id}`, courseToUpdate);
    return response.data;
}