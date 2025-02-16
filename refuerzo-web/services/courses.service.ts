import { api } from '@/lib/api';

import { Course, CourseResponse } from '@/types/types';

export const getCourses = async (): Promise<Course[]> => {
    const response = await api.get<CourseResponse>('/seccion');
    return response.data.data;
};