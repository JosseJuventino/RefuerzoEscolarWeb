"use client";
import React, { useState} from "react";
import data from "@/data/asistencia.json";

interface Asistencia {
  id: number;
  nombre: string;
  fecha: string;
  hora: string;
  asistio: boolean;
}

export default function Asistencia() {
  const [alumnos] = useState<string[]>(data.alumnos);
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
      <h1 className="text-2xl font-bold mb-4">Registro de Asistencia</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <ul className="space-y-2">
        {alumnos.map((alumno, index) => {
          const yaRegistrado = asistencias.some(
            (asistencia) => asistencia.nombre === alumno && asistencia.fecha === new Date().toISOString().split("T")[0]
          );

          return (
            <li
              key={index}
              className="flex flex-col md:flex-row justify-between items-center bg-white shadow rounded-lg p-4"
            >
              <span className="text-lg md:text-base mb-2 md:mb-0">{alumno}</span>
              <button
                onClick={() => registrarAsistencia(alumno)}
                disabled={yaRegistrado}
                className={`px-4 py-2 rounded-lg text-white w-full md:w-auto ${
                  yaRegistrado ? "bg-gray-400 cursor-not-allowed" : "bg-blue_principal hover:bg-sky-950"
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