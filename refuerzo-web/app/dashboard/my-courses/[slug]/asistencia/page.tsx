"use client";
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { CourseContext } from "@/app/contexts/course-context";
import Image from "next/image";
import { CircleUser, Check, X, TriangleAlert } from "lucide-react";
import type { Asistencia, AsistenciaEncargado } from "@/types/types";
import {
  getAsistenciaByCourseId,
  updateAsistenciaById,
  addAsistenciaEncargadoIndividualy
} from "@/services/asistencia.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { capitalize } from "@/utils/utils";
import { toast } from "@pheralb/toast";
import { useWarnIfUnsavedChanges } from "@/hooks/useWarnUnsavedChanges";
import { FormAsistenciaEncargado } from "@/components/Popups/AddEncargadoAsistenciaModal";

type EstadoAsistencia = "asistió" | "falto" | "permiso";

const getCurrentDateString = () => new Date().toISOString().split("T")[0];

export default function Asistencia() {
  const course = useContext(CourseContext);
  const queryClient = useQueryClient();

  const [localAsistencia, setLocalAsistencia] = useState<Asistencia>({
    _id: "",
    seccionId: course?._id || "",
    alumnos: [],
    encargados: [],
  });

  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    selected: Partial<AsistenciaEncargado> | null;
  }>({ type: null, selected: null });

  const { data: asistenciaResponse } = useQuery<Asistencia>({
    queryKey: ["asistencia", course?._id],
    queryFn: () => getAsistenciaByCourseId(course?._id as string),
    enabled: !!course?._id,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialAlumnosRef = useRef(localAsistencia.alumnos);
  const initialEncargadosRef = useRef(localAsistencia.encargados);
  const [view, setView] = useState("estudiante");

  const handleView = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setView(e.target.value);
  }

  useWarnIfUnsavedChanges(hasUnsavedChanges);

  const updateAsistenciaByIdMutation = useMutation({
    mutationFn: updateAsistenciaById,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asistencia", course?._id],
      });
    },
  });

  const addAsistenciaEncargadoIndividualyMutation = useMutation<Asistencia, unknown, { encargado: Partial<AsistenciaEncargado>, id_section: string }>({
    mutationFn: ({ encargado, id_section }) => addAsistenciaEncargadoIndividualy(encargado, id_section),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asistencia", course?._id],
      });
    },
  });

  useEffect(() => {
    if (asistenciaResponse) {
      console.log("asistenciaResponse", asistenciaResponse);

      const todayAsistencias = {
        ...asistenciaResponse,
        alumnos: asistenciaResponse.alumnos.filter(
          (alumno: { fecha: string }) =>
            new Date(alumno.fecha).toISOString().split("T")[0] ===
            getCurrentDateString()
        ),
        encargados: asistenciaResponse.encargados.filter(
          (encargado: { fecha: string }) =>
            new Date(encargado.fecha).toISOString().split("T")[0] ===
            getCurrentDateString()
        ),
      };

      setLocalAsistencia(todayAsistencias);
      initialAlumnosRef.current = todayAsistencias.alumnos;
      initialEncargadosRef.current = todayAsistencias.encargados;
    }
  }, [asistenciaResponse]);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(localAsistencia.alumnos) !==
      JSON.stringify(initialAlumnosRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [localAsistencia.alumnos]);

  const handleAdd = (formData: AsistenciaEncargado) => {
    if (!modalState.selected) return;

    const payload: AsistenciaEncargado = {
      userId: modalState.selected._id || "",
      fecha: new Date(formData.fecha).toISOString(),
      estado: formData.estado,
      hora_inicio: new Date(`${formData.fecha}T${formData.hora_inicio}`).toISOString(),
      hora_fin: new Date(`${formData.fecha}T${formData.hora_fin}`).toISOString(),
    };

    const finalPromise = addAsistenciaEncargadoIndividualyMutation.mutateAsync({ encargado: payload, id_section: course?._id as string });

    toast.loading({
      text: "Registrando asistencia...",
      options: {
        promise: finalPromise,
        success: "Asistencia registrada exitosamente 🎉",
        error: "Error al guardar la asistencia 😢",
        autoDismiss: true,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["asistencia"] });
          initialEncargadosRef.current = localAsistencia.encargados;
          setHasUnsavedChanges(false);
          setModalState({ type: null, selected: null });
        },
        onError: (error: unknown) => {
          const err = error as { response?: { status: number, message: string } };
          if (err.response && err.response.status === 409)
            toast.error({ text: "El usuario tiene horarios solapados" });
          else {
            console.log(error);
            toast.error({ text: "Error al guardar la asistencia" });
          }
        },
      },
    });
  }

  const handleEstadoAsistencia = useCallback(
    (alumnoId: string, estado: EstadoAsistencia) => {
      setLocalAsistencia((prev) => {
        const alumno = course?.alumnos.find((a) => a._id === alumnoId);
        if (!alumno) return prev;

        const existingIndex = prev.alumnos.findIndex(
          (a) => a.alumnoId === alumnoId
        );
        const newAsistencia = {
          alumnoId: alumno._id,
          fecha: new Date().toISOString(),
          estado,
          nombre: alumno.nombre,
          imagen: alumno.image,
        };

        const updatedAlumnos = [...prev.alumnos];

        if (existingIndex === -1) {
          updatedAlumnos.push(newAsistencia);
        } else {
          updatedAlumnos[existingIndex] = newAsistencia;
        }

        return {
          ...prev,
          alumnos: updatedAlumnos,
        };
      });
    },
    [course]
  );


  const closeModal = () => setModalState({ type: null, selected: null, });


  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "asistio":
      case "asistió":
        return "bg-green-100 text-green-800";
      case "falto":
        return "bg-red-100 text-red-800";
      case "permiso":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGuardar = () => {
    const payload: Asistencia = {
      ...localAsistencia,
      seccionId: course?._id || "",
    };

    const finalPromise = updateAsistenciaByIdMutation.mutateAsync(payload);

    toast.loading({
      text: "Actualizando asistencia...",
      options: {
        promise: finalPromise,
        success: "Asistencia registrada exitosamente 🎉",
        error: "Error al guardar la asistencia 😢",
        autoDismiss: true,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["asistencia"] });
          initialAlumnosRef.current = localAsistencia.alumnos;
          setHasUnsavedChanges(false);
        },
        onError: (error) => {
          console.error("Detalles del error:", error);
        },
      },
    });
  };

  if (!course) return <div>Seleccione un curso primero</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between gap-4">
            <h1 className="sm:text-2xl my-1 text-base text-blue_principal font-bold">
              Registro de Asistencia
            </h1>
            <button
              onClick={handleGuardar}
              className="bg-blue_principal text-white sm:px-6 sm:py-0 px-2 py-0 rounded-lg transition-colors disabled:bg-gray-300"
              disabled={!hasUnsavedChanges}
            >
              Guardar Asistencias
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-row-reverse items-center gap-4 pb-5">
        <select name="select" onChange={handleView} id="" className="bg-white outline-none text-blue_principal border border-gray-200 rounded-lg px-4 py-2">
          <option value="estudiante">Estudiantes</option>
          <option value="encargado">Encargados</option>
        </select>
      </div>

      <div className="space-y-4">
        {view == "estudiante" && course.alumnos.map((alumno) => {
          const asistencia = localAsistencia.alumnos.find(
            (a) => a.alumnoId === alumno._id
          );
          return (
            <div
              key={alumno._id}
              className="flex sm:flex-row flex-col  items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex flex-row items-center gap-4 flex-1">
                {alumno.image ? (
                  <Image
                    src={alumno.image}
                    alt={alumno.nombre}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="p-2 rounded-full bg-gray-100">
                    <CircleUser className="w-8 h-8 text-blue_principal" />
                  </div>
                )}
                <div className="flex flex-row justify-end items-end gap-2">
                  <div className="max-w-[150px] sm:max-w-[200px]">
                    {" "}
                    <p className="font-medium text-gray-900">{alumno.nombre}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {alumno.email}
                    </p>{" "}
                  </div>
                  {asistencia ? (
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-sm ${getEstadoColor(
                        asistencia.estado
                      )}`}
                    >
                      {capitalize(asistencia.estado)}
                    </span>
                  ) : (
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-center text-sm bg-gray-100 text-gray-800`}
                    >
                      No registrado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:mt-0 mt-3">
                <button
                  onClick={() => handleEstadoAsistencia(alumno._id, "asistió")}
                  className={`px-3 py-2 rounded-lg ${asistencia?.estado === "asistió"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-600"
                    } hover:bg-green-200 transition-colors`}
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => handleEstadoAsistencia(alumno._id, "falto")}
                  className={`px-3 py-2 rounded-lg ${asistencia?.estado === "falto"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-600"
                    } hover:bg-red-200 transition-colors`}
                >
                  <X size={20} />
                </button>
                <button
                  onClick={() => handleEstadoAsistencia(alumno._id, "permiso")}
                  className={`px-3 py-2 rounded-lg ${asistencia?.estado === "permiso"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-100 text-yellow-600"
                    } hover:bg-yellow-200 transition-colors`}
                >
                  <TriangleAlert size={20} />
                </button>
              </div>
            </div>
          );
        })}

        {view == "encargado" && course.encargados.map((alumno) => {
          const asistencia = localAsistencia.encargados.find(
            (a) => a.userId === alumno._id
          );
          return (
            <div
              key={alumno._id}
              className="flex sm:flex-row flex-col  items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex flex-row items-center gap-4 flex-1">
                {alumno.image ? (
                  <Image
                    src={alumno.image}
                    alt={alumno.nombre}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="p-2 rounded-full bg-gray-100">
                    <CircleUser className="w-8 h-8 text-blue_principal" />
                  </div>
                )}
                <div className="flex flex-row justify-end items-end gap-2">
                  <div className="max-w-[150px] sm:max-w-[200px]">
                    {" "}
                    <p className="font-medium text-gray-900">{alumno.nombre}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {alumno.email}
                    </p>{" "}
                  </div>
                  {asistencia ? (
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-sm ${getEstadoColor(
                        asistencia.estado
                      )}`}
                    >
                      {capitalize(asistencia.estado)}
                    </span>
                  ) : (
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-center text-sm bg-gray-100 text-gray-800`}
                    >
                      No registrado
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setModalState({ type: 'add', selected: alumno })} className="px-3 py-2 rounded-lg bg-blue_principal text-white hover:bg-blue-800 transition-colors">
                Registrar asistencia
              </button>
            </div>


          );
        })}

        <FormAsistenciaEncargado
          isOpen={modalState.type === 'add'}
          title="Asistencia"
          onClose={closeModal}
          onSubmit={handleAdd}
        />
      </div>
    </div>
  );
}
