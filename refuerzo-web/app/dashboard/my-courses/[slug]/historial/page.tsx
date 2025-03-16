"use client";
import React, { useState } from "react";
import data from "@/data/asistencia.json";

interface Asistencia {
  id: number;
  nombre: string;
  fecha: string;
  hora: string;
  asistio: boolean;
}

export default function HistorialAsistencia() {
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());

  const alumnos: string[] = data.alumnos;
  const asistencias: Asistencia[] = data.asistencias;

  const getSabaditosDelMes = (year: number, month: number): Date[] => {
    const sabados: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === 6) {
        sabados.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return sabados;
  };

  const sabadosDelMes = getSabaditosDelMes(anio, mes);

  const asistioElSabado = (nombre: string, fecha: Date): boolean => {
    return asistencias.some(
      (asistencia) =>
        asistencia.nombre === nombre &&
        new Date(asistencia.fecha).toDateString() === fecha.toDateString()
    );
  };

  const getHoraAsistencia = (nombre: string, fecha: Date): string | null => {
    const asistencia = asistencias.find(
      (a) =>
        a.nombre === nombre &&
        new Date(a.fecha).toDateString() === fecha.toDateString()
    );
    return asistencia ? asistencia.hora : null;
  };

  return (
    <div className="sm:p-0 p-2">
      <h1 className="text-2xl font-bold mb-4">Historial de Asistencia</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2"
          >
            {[
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ].map((nombreMes, index) => (
              <option key={index} value={index}>
                {nombreMes}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(parseInt(e.target.value))}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-24"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden bg-white shadow rounded-lg">
          <thead className="bg-blue_principal text-white">
            <tr>
              <th className="py-3 px-4 border-b">Alumno</th>
              {sabadosDelMes.map((sabado, index) => (
                <th key={index} className="py-2 px-4 border-b">
                  {sabado.toLocaleDateString()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{alumno}</td>
                {sabadosDelMes.map((sabado, idx) => {
                  const asistio = asistioElSabado(alumno, sabado);
                  const hora = getHoraAsistencia(alumno, sabado);
                  return (
                    <td key={idx} className="py-2 px-4 border-b text-center">
                      <div className="relative group">
                        {asistio ? (
                          <span className="text-green-500 cursor-pointer">✔️</span>
                        ) : (
                          <span className="text-red-500 cursor-pointer">❌</span>
                        )}
                        {hora && (
                          <div className="absolute hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded-lg -mt-8 -ml-4">
                            {hora}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
