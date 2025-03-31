"use client";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { AsistenciaAlumno, AsistenciaEncargado, HistoryAsistenciaResponse } from "@/types/types";
import { getAsistenciaByDateAlumnos, getAsistenciaByDateEncargados } from "@/services/asistencia.service";
import { useQuery } from "@tanstack/react-query";
import { CourseContext } from "@/app/contexts/course-context";
import { Check, TriangleAlert, X } from "lucide-react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import HistoryTable from "@/components/Asistencia/HistoryTable";

export default function HistorialAsistencia() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const course = useContext(CourseContext);
  const [view, setView] = useState("estudiante");

  const handleView = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setView(e.target.value);
  }

  const fetchAsistencias = useCallback(async () => {
    if (!course?._id) {
      throw new Error("No course id available");
    }
    return await getAsistenciaByDateAlumnos(
      course._id,
      mes.toString(),
      anio.toString()
    );
  }, [course?._id, mes, anio]);

  const fetchAsistenciasEncargados = useCallback(async () => {
    if (!course?._id) {
      throw new Error("No course id available");
    }

    return await getAsistenciaByDateEncargados(
      course._id,
      mes.toString(),
      anio.toString()
    );
  }, [course?._id, mes, anio]);

  const { data: asistencias } = useQuery<HistoryAsistenciaResponse<AsistenciaAlumno>>({
    queryKey: ['course-alumnos', course?._id, mes, anio], // Key única
    queryFn: fetchAsistencias,
  });

  // Para encargados
  const { data: asistenciasEncargado } = useQuery<HistoryAsistenciaResponse<AsistenciaEncargado>>({
    queryKey: ['course-encargados', course?._id, mes, anio], // Key única
    queryFn: fetchAsistenciasEncargados,
  });

  console.log("asistenciasEncargados", asistenciasEncargado);


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

  const getEstadoAsistenciaEncargados = (alumnoId: string, fecha: Date): string | null => {
    const fechaKey = formatDate(fecha);
    const registro = asistenciasEncargado?.data[fechaKey]?.find(
      (asistencia) => asistencia.userId === alumnoId
    );
    return registro?.estado || null;
  };


  const iconosEstado = React.useMemo(
    () => ({
      'asistió': <Check className="w-5 h-5 text-green-500" />,
      'asistio': <Check className="w-5 h-5 text-green-500" />,
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
            className="bg-white outline-none text-blue_principal border border-gray-200 rounded-lg px-4 py-2"
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
            min="2025"
            onChange={(e) => {
              const nuevoAnio = parseInt(e.target.value);
              setAnio(nuevoAnio >= 2025 ? nuevoAnio : 2025);
            }}
            className="bg-white border text-blue_principal border-gray-300 rounded-lg px-4 py-2 w-24"
          />
        </div>
        <div>
          <select name="select" onChange={handleView} id="" className="bg-white outline-none text-blue_principal border border-gray-200 rounded-lg px-4 py-2">
            <option value="estudiante">Estudiantes</option>
            <option value="encargado">Encargados</option>
          </select>
        </div>
      </div>



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
          {view == "estudiante" && course?.alumnos?.map((alumno) => (
            <HistoryTable isAlumno={true} alumno={alumno} sabadosDelMes={sabadosDelMes} getEstadoAsistencia={getEstadoAsistencia} getIconoEstado={getIconoEstado} key={alumno._id} />
          ))}

          {view == "encargado" && course?.encargados?.map((alumno) => (
            <HistoryTable isAlumno={false} alumno={alumno} sabadosDelMes={sabadosDelMes} getEstadoAsistencia={getEstadoAsistenciaEncargados} getIconoEstado={getIconoEstado} key={alumno._id} />
          ))}
        </tbody>
      </table>

      <ReactTooltip
        id="avatar-tooltip"
        className="z-50"
        place="top"
      />
    </div>
  );
}