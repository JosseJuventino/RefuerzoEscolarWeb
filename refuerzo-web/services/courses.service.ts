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
