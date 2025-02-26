import React from 'react';
import { Course } from '@/types/types';

export const CourseContext = React.createContext<Course | undefined>(undefined);