"use client"

import { useState } from "react";
import PageHeader from '@/components/Dashboard/PageHeader'
import Table from '@/components/Tables/Table';
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import { Column } from "@/types/types";
import { Tooltip as ReactTooltip } from "react-tooltip";

type Course = {
    _id: string;
    name: string;
    professors: string[]; 
    backgroundImage: string;
    novedades: {
        _id: number;
        professor: string;
        message: string;
        description: string;
        files: string[];
        date: string;
    }[];
};

const mockCourses: Course[] = [
    {
        _id: "1",
        name: "Matemática I",
        professors: ["Juan Pérez", "Ana García", "Luis Martínez"], // Ejemplo con 3 profesores
        backgroundImage: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/164EE/production/_109347319_gettyimages-611195980.jpg.webp",
        novedades: [
            {
                _id: 1,
                professor: "Juan Pérez",
                message: "publicó un nuevo anuncio",
                description: "Este es el detalle del anuncio con más información.",
                files: ["documento1.pdf", "guia-de-trabajo.pdf"],
                date: "18 de enero de 2025"
            }
        ]
    },
    {
        _id: "2",
        name: "Física Básica",
        professors: ["María Gómez", "Pedro Sánchez"], // Ejemplo con 2 profesores
        backgroundImage: "https://cdn-blog.superprof.com/blog_co/wp-content/uploads/2020/10/las-matematicas.jpeg",
        novedades: []
    },
    {
        _id: "3",
        name: "Literatura Contemporánea",
        professors: ["Carlos Rodríguez", "Laura Méndez", "Diego Fernández"], // Ejemplo con 3 profesores
        backgroundImage: "https://concepto.de/wp-content/uploads/2022/06/zeus-mitologia-griega-antiguedad-e1654649070387.jpg",
        novedades: []
    }
];

const CourseCard = ({ course }: { course: Course }) => (
    <div
        className="relative rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-48"
        style={{ backgroundImage: `url(${course.backgroundImage})` }}
    >
        <div className="absolute inset-0 bg-black bg-opacity-40 p-4 flex flex-col justify-end">
            <h3 className="text-xl font-bold text-white">{course.name}</h3>
            <div className="text-white text-sm">
                {course.professors.map((professor, index) => (
                    <span
                        key={professor}
                        data-tooltip-id="professor-tooltip"
                        data-tooltip-content={professor}
                    >
                        {professor}
                        {index < course.professors.length - 1 && ', '}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

const columns: Column<Course>[] = [
    {
        header: "Curso",
        accessor: (course) => (
            <div className="flex items-center gap-3 group">
                <div
                    className="w-8 h-8 rounded-lg bg-cover bg-center shadow-sm"
                    style={{ backgroundImage: `url(${course.backgroundImage})` }}
                />
                <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {course.name}
                </span>
            </div>
        ),
    },
    {
        header: "Profesores",
        accessor: (course) => (
            <div className="flex items-center -space-x-2 hover:space-x-1 transition-spacing cursor-pointer">
                {course.professors.slice(0, 3).map((professor) => (
                    <div
                        key={professor}
                        className="relative "
                        data-tooltip-id="avatar-tooltip"
                        data-tooltip-content={professor}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-sm">
                            <span className="text-xs font-medium text-blue-600">
                                {professor.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                    </div>
                ))}
                {course.professors.length > 3 && (
                    <span
                        className="text-sm text-gray-500 ml-2"
                        data-tooltip-id="remaining-tooltip"
                        data-tooltip-content={course.professors.slice(3).join(', ')}
                    >
                        + {course.professors.length - 3} más
                    </span>
                )}
            </div>
        ),
    },
];

export default function CoursesPage() {
    const [isCardView, setIsCardView] = useState(true);

    return (
        <div className='p-10'>
            <PageHeader
                title="Cursos"
            />


            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {isCardView ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockCourses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="mt-4 overflow-auto bg-white rounded-lg shadow-md">
                    <Table
                        data={mockCourses}
                        columns={columns}
                        loading={false}
                        onEdit={(row) => console.log("Editar:", row)}
                        onDelete={(id) => console.log("Eliminar:", id)}
                    />
                </div>
            )}

            <ReactTooltip
                id="professor-tooltip"
                className="z-50"
                place="top"
            />
            <ReactTooltip
                id="avatar-tooltip"
                className="z-50"
                place="top"
            />
            <ReactTooltip
                id="remaining-tooltip"
                className="z-50"
                place="top"
            />
        </div>
    );
}