"use client";
import React, { useContext, useMemo, useState } from "react";
import { HistoryAsistenciaResponse } from "@/types/types";
import { getAsistenciaByDateAlumnos } from "@/services/asistencia.service";
import { useQuery } from "@tanstack/react-query";
import { CourseContext } from "@/app/contexts/course-context";
import { Check, TriangleAlert, X } from "lucide-react";
import Image from "next/image";

export default function HistorialAsistencia() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const course = useContext(CourseContext);

  const queryKey = useMemo(
    () => ['course', course?._id, mes, anio],
    [course?._id, mes, anio]
  );

  const fetchAsistencias = React.useCallback(async () => {
    if (!course?._id) {
      throw new Error("No course id available");
    }
    return await getAsistenciaByDateAlumnos(
      course._id,
      mes.toString(),
      anio.toString()
    );
  }, [course?._id, mes, anio]);

  const { data: asistencias } = useQuery<HistoryAsistenciaResponse>({
    queryKey,
    queryFn: fetchAsistencias,
  });

  const getSabaditosDelMes = (() => {
    const cache = new Map<string, Date[]>();
    return (year: number, month: number): Date[] => {
      const key = `${year}-${month}`;
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const sabados: Date[] = [];
      const date = new Date(year, month, 1);
      while (date.getMonth() === month) {
        if (date.getDay() === 6) {
          sabados.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
      }
      cache.set(key, sabados);
      return sabados;
    };
  })();

  const sabadosDelMes = useMemo(
    () => getSabaditosDelMes(anio, mes - 1),
    [anio, mes, getSabaditosDelMes]
  );

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getEstadoAsistencia = (alumnoId: string, fecha: Date): string | null => {
    const fechaKey = formatDate(fecha);
    const registro = asistencias?.data[fechaKey]?.find(
      (asistencia) => asistencia.alumnoId === alumnoId
    );
    return registro?.estado || null;
  };


  const iconosEstado = React.useMemo(
    () => ({
      'asistió': <Check className="w-5 h-5 text-green-500" />,
      'falto': <X className="w-5 h-5 text-red-500" />,
      'permiso': <TriangleAlert className="w-5 h-5 text-yellow-500" />,
    }),
    []
  );

  const getIconoEstado = (estado: string | null) =>
    estado ? iconosEstado[estado as keyof typeof iconosEstado] ?? null : null;

  return (
    <div className="sm:p-0 p-2">
      <h1 className="text-2xl font-bold mb-4 text-blue_principal">Historial de Asistencia</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={mes - 1}
            onChange={(e) => setMes(parseInt(e.target.value) + 1)}
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
              <th className="py-3 px-4 border-b">Imagen</th>
              <th className="py-3 px-4 border-b">Nombre</th>
              {sabadosDelMes.map((sabado, index) => (
                <th key={index} className="py-2 px-4 border-b">
                  {sabado.toLocaleDateString()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {course?.alumnos?.map((alumno) => (
              <tr key={alumno._id} className="hover:bg-gray-50">
                <td className="py-2 flex flex-row justify-center gap-2 px-4 border-b">
                  <div>
                    <Image
                      src={alumno.image}
                      alt={`Avatar de ${alumno.nombre}`}
                      className="w-10 h-10 rounded-full object-cover"
                      width={40}
                      height={40}
                      priority
                    />
                  </div>
                </td>

                <td className="py-2 gap-2 px-4 border-b text-center">
                  {alumno.nombre}
                </td>

                {sabadosDelMes.map((sabado, idx) => {
                  const estado = getEstadoAsistencia(alumno._id, sabado);
                  return (
                    <td key={idx} className="py-2 px-4 border-b text-center">
                      <div className="relative flex flex-row justify-center group">
                        {getIconoEstado(estado)}
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