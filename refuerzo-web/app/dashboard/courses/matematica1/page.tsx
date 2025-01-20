'use client';

import { FileText, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { FaRegFilePdf } from "react-icons/fa6";

export default function Tablon() {
  const course = {
    name: 'Matemática I',
    professor: 'Juan Pérez',
    schedule: 'Lunes y Miércoles, 10:00 AM - 12:00 PM',
  };

  const novedades = [
    {
      id: 1,
      professor: 'Juan Pérez',
      message: 'publicó un nuevo anuncio',
      description: 'Este es el detalle del anuncio con más información.',
      files: ['documento1.pdf', 'guia-de-trabajo.pdf'],
      date: '18 de enero de 2025',
    },
    {
      id: 2,
      professor: 'Juan Pérez',
      message: 'subió una guía de estudio',
      description: 'Se trata de una guía completa para el próximo examen.',
      files: ['guia-estudio.pdf'],
      date: '17 de enero de 2025',
    },
    {
      id: 3,
      professor: 'Juan Pérez',
      message: 'publicó un nuevo anuncio',
      description: 'Este anuncio contiene información importante.',
      files: [],
      date: '15 de enero de 2025',
    },
    {
      id: 4,
      professor: 'Juan Pérez',
      message: 'subió una guía de estudio',
      description: 'Guía adicional para profundizar en el tema.',
      files: ['tema-adicional.pdf'],
      date: '12 de enero de 2025',
    },
  ];

  const [openId, setOpenId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
        <p className="mt-2 text-gray-700">
          <span className="font-semibold">Profesor: </span>
          {course.professor}
        </p>
        <p className="mt-1 text-gray-700">
          <span className="font-semibold">Horario: </span>
          {course.schedule}
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 ml-4">
          Novedades
        </h2>
        <ul className="space-y-4">
          {novedades.map((novedad) => (
            <li key={novedad.id} className="bg-white shadow rounded-lg">
              <div
                className="p-4 flex items-center space-x-4 cursor-pointer"
                onClick={() => handleToggle(novedad.id)}
              >
                <div className=' p-2 rounded-full'>{getIconByMessage(novedad.message)}</div>

                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    <span className="font-bold">{novedad.professor}</span>{" "}
                    {novedad.message}
                  </p>
                  <p className="text-gray-500 text-sm">{novedad.date}</p>
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
                    {novedad.description || "Sin descripción disponible."}
                  </p>

                  {novedad.files.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {novedad.files.map((file, index) => (
                        <a
                          key={index}
                          href={`/uploads/${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 px-4 py-2 rounded-lg border border-gray-300 shadow-sm"
                        >
                          <FaRegFilePdf className="w-4 h-4 text-gray-500" />
                          {file}
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
