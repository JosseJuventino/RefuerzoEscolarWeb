"use client"
import { FileText, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaRegFilePdf } from "react-icons/fa6";
import { useParams } from 'next/navigation';
import { getCourseBySlug } from '@/services/courses.service';
import { Course } from '@/types/types';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

export default function Tablon() {
  const [course, setCourse] = useState<Course | null>(null);
  const { slug } = useParams();

  const [openId, setOpenId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const fetchCourseBySlug = async () => {
    const course = await getCourseBySlug(slug as string);
    setCourse(course);
  };

  useEffect(() => {
    fetchCourseBySlug();
  });


  const getIconByMessage = (message: string) => {
    if (message.includes('anuncio')) {
      return <ClipboardList className="text-beige_secondary w-6 h-6" />;
    }
    if (message.includes('guía')) {
      return <FileText className="text-blue_principal w-6 h-6" />;
    }
    return null;
  };

  return (
    <div>
      <div
        className="relative h-52 cursor-pointer rounded-xl bg-center shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
        style={{
          backgroundImage: `url(${course?.backgroundImage})`,
          backgroundSize: '120%',
          backgroundPosition: 'center',
          transition: 'background-size 0.3s ease'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 flex flex-col justify-end">
          <div className="transform transition-transform group-hover:translate-y-1">
            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              {course?.nombre}
            </h3>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl mt-10 text-blue_principal font-semibold mb-4">
          Novedades
        </h2>
        <ul className="space-y-4">
          {course?.publicaciones?.map((novedad) => (
            <li key={novedad.seccionId} className="bg-white shadow rounded-lg">
              <div
                className="p-4 flex items-center space-x-4 cursor-pointer"
                onClick={() => handleToggle(novedad.id)}
              >
                <div className="p-2 rounded-full">{getIconByMessage(novedad.categoria)}</div>

                <div className="flex-1">
                  <p className="text-gray-900 flex flex-row gap-3 items-center">
                    <span>{novedad.titulo}</span>{" "}
                    <span className='text-gray-400'>
                      {formatRelativeTime(course.createdAt)}
                    </span>
                  </p>
                </div>

                <div>
                  {openId === novedad.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              {openId === novedad.id && (
                <div className="p-4 border-t border-gray-200">
                  <p className="text-gray-700 mb-2">
                    {novedad.descripcion || "Sin descripción disponible."}
                  </p>

                  {novedad.files.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {novedad.files.map((file, index) => (
                        <a
                          key={index}
                          href={`${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 px-4 py-2 rounded-lg border border-gray-300 shadow-sm"
                        >
                          <FaRegFilePdf className="w-4 h-4 text-gray-500" />
                          {file.originalFileName}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay archivos adjuntos.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}