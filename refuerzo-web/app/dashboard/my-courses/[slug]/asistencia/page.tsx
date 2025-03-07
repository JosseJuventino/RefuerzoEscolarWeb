"use client";
import React, { useContext, useState } from "react";
import data from "@/data/asistencia.json";
import { CourseContext } from "@/app/contexts/course-context";
import Image from "next/image";
import { CircleUser } from "lucide-react";


interface Asistencia {
  id: number;
  nombre: string;
  fecha: string;
  hora: string;
  asistio: boolean;
}

export default function Asistencia() {
  const course = useContext(CourseContext);

  const [asistencias, setAsistencias] = useState<Asistencia[]>(data.asistencias);
  const [error, setError] = useState<string | null>(null);

  const registrarAsistencia = (nombre: string) => {
    const fechaActual = new Date();
    const fechaStr = fechaActual.toISOString().split("T")[0];
    const horaStr = fechaActual.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const asistenciaExistente = asistencias.some(
      (asistencia) => asistencia.nombre === nombre && asistencia.fecha === fechaStr
    );

    if (asistenciaExistente) {
      setError(`El alumno ${nombre} ya ha registrado su asistencia hoy.`);
      return;
    }

    const nuevaAsistencia: Asistencia = {
      id: asistencias.length + 1,
      nombre,
      fecha: fechaStr,
      hora: horaStr,
      asistio: true,
    };

    setAsistencias([...asistencias, nuevaAsistencia]);
    setError(null);
  };

  const quitarAsistencia = (id: number) => {
    setAsistencias(asistencias.filter((asistencia) => asistencia.id !== id));
  };

  return (
    <div className="">
      <h1 className="text-2xl text-blue_principal font-bold mb-4">Registro de Asistencia</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <ul className="space-y-2">
        {course?.alumnos.map((alumno, index) => {
          const yaRegistrado = asistencias.some(
            (asistencia) => asistencia.nombre === alumno.nombre && asistencia.fecha === new Date().toISOString().split("T")[0]
          );

          return (
            <li
              key={index}
              className="flex flex-col md:flex-row justify-between items-center bg-white shadow rounded-lg p-4"
            >
              <div className="flex flex-row items-center gap-2">
                {alumno.image ? (
                  <Image
                    src={alumno.image}
                    alt={alumno.nombre}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                    priority
                  />
                ) : (
                  <div className="p-2 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                    <CircleUser className="w-8 h-8 text-blue_principal" />
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-gray-900">{alumno.nombre}</p>
                  <p className="text-md text-gray-600">{alumno.email}</p>
                </div>
              </div>
              <button
                onClick={() => registrarAsistencia(alumno.nombre)}
                disabled={yaRegistrado}
                className={`px-4 py-2 rounded-lg text-white w-full md:w-auto ${yaRegistrado ? "bg-gray-400 cursor-not-allowed" : "bg-blue_principal hover:bg-sky-950"
                  }`}
              >
                {yaRegistrado ? "Registrado" : "Registrar Asistencia"}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Asistencias Registradas</h2>
        <ul className="space-y-2">
          {asistencias.map((asistencia) => (
            <li
              key={asistencia.id}
              className="flex flex-col md:flex-row justify-between items-center bg-white shadow rounded-lg p-4"
            >
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <span className="font-medium">{asistencia.nombre}</span>
                <span>{asistencia.fecha}</span>
                <span>{asistencia.hora}</span>
              </div>
              <button
                onClick={() => quitarAsistencia(asistencia.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full md:w-auto mt-2 md:mt-0"
              >
                Quitar Asistencia
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}