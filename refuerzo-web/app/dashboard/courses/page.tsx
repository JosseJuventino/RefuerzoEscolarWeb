"use client"

import { useState } from "react";
import PageHeader from '@/components/Dashboard/PageHeader'
import Table from '@/components/Tables/Table';
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import { Column, Course } from "@/types/types";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { getCourses } from "@/services/courses.service";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/Loading";
import ServerErrorPage from "@/app/error";
import Link from "next/link";


const CourseCard = ({ course }: { course: Course }) => (
    <Link
        href={`/dashboard/my-courses/${course.slug}`}
        className="relative cursor-pointer rounded-xl bg-center shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-48 group"
        style={{
            backgroundImage: `url(${course.backgroundImage})`,
            backgroundSize: '120%',
            backgroundPosition: 'center',
            transition: 'background-size 0.3s ease'
        }}
    >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 flex flex-col justify-end">
            <div className="transform transition-transform group-hover:translate-y-1">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">
                    {course.nombre}
                </h3>

                <div className="flex flex-wrap gap-1 text-white/90 text-sm">
                    {course.encargados.map((professor) => (
                        <span
                            key={professor._id}
                            className="px-3 py-1 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/30 transition-colors"
                            data-tooltip-id="professor-tooltip"
                            data-tooltip-content={professor.nombre}
                        >
                            {professor.nombre.split(' ').map(n => n[0]).join('')}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </Link>
);

const columns: Column<Course>[] = [
    {
        header: "Curso",
        accessor: (course) => (
            <Link href={`/dashboard/my-courses/${course.slug}`} className="flex items-center gap-3 group">
                <div
                    className="w-8 h-8 rounded-lg bg-cover bg-center shadow-sm"
                    style={{ backgroundImage: `url(${course.backgroundImage})` }}
                />
                <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {course.nombre}
                </span>
            </Link>
        ),
    },
    {
        header: "Profesores",
        accessor: (course) => (
            <div className="flex items-center -space-x-2 hover:space-x-1 transition-spacing cursor-pointer">
                {course.encargados.slice(0, 3).map((professor) => (
                    <div
                        key={professor._id}
                        className="relative "
                        data-tooltip-id="avatar-tooltip"
                        data-tooltip-content={professor.nombre}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-sm">
                            <span className="text-xs font-medium text-blue-600">
                                {professor.nombre.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                    </div>
                ))}
                {course.encargados.length > 3 && (
                    <span
                        className="text-sm text-gray-500 ml-2"
                        data-tooltip-id="remaining-tooltip"
                        data-tooltip-content={course.encargados.slice(3).join(', ')}
                    >
                        + {course.encargados.length - 3} más
                    </span>
                )}
            </div>
        ),
    },
];

export default function CoursesPage() {
    const [isCardView, setIsCardView] = useState(true);

    const {
        data: cursos,
        isLoading,
        isError,
    } = useQuery<Course[], Error>({
        queryKey: ["cursos"],
        queryFn: getCourses,
    });




    if (isLoading) return <Loading />

    if (isError) return <ServerErrorPage />

    return (
        <div className='p-10'>
            <PageHeader
                title="Cursos"
            />


            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {isCardView ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cursos && cursos?.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="mt-4  bg-white rounded-lg shadow-md">
                    <Table
                        data={cursos ?? []}
                        columns={columns}
                        loading={false}
                        hasEdit={false}
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