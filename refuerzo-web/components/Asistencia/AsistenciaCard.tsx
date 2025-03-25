import { Asistencia, AsistenciaEncargado } from "@/types/types";
import { getEstadoColor } from "@/utils/getEstadoColor";
import { capitalize } from "@/utils/utils";
import { Check, CircleUser, TriangleAlert, X } from "lucide-react";
import Image from "next/image";

interface AsistenciaCardProps {
    localAsistencia: Asistencia;
    alumno: {
        _id: string;
        nombre: string;
        image: string;
        email: string;
        telefono: string;
    };
    setModalState?: (state: {
        type: 'add' | 'edit' | 'delete' | null;
        selected: Partial<AsistenciaEncargado> | null;
    }) => void;
    isAlumno: boolean;
    handleEstadoAsistencia?: (alumnoId: string, estado: "asistió" | "falto" | "permiso") => void;
}

export default function AsistenciaCard({
    localAsistencia,
    alumno,
    setModalState,
    isAlumno,
    handleEstadoAsistencia
}: AsistenciaCardProps) {
    let asistencia;

    if (isAlumno) {
        asistencia = localAsistencia.alumnos.find((a) => a.alumnoId === alumno._id);
    } else {
        asistencia = localAsistencia.encargados.find((a) => a.userId === alumno._id);
    }
    return (
        <div>
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
                {isAlumno ? (
                    <div className="flex gap-2 sm:mt-0 mt-3">
                        <button
                            onClick={() => handleEstadoAsistencia?.(alumno._id, "asistió")}
                            className={`px-3 py-2 rounded-lg ${asistencia?.estado === "asistió"
                                ? "bg-green-600 text-white"
                                : "bg-green-100 text-green-600"
                                } hover:bg-green-200 transition-colors`}
                        >
                            <Check size={20} />
                        </button>
                        <button
                            onClick={() => handleEstadoAsistencia?.(alumno._id, "falto")}
                            className={`px-3 py-2 rounded-lg ${asistencia?.estado === "falto"
                                ? "bg-red-600 text-white"
                                : "bg-red-100 text-red-600"
                                } hover:bg-red-200 transition-colors`}
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={() => handleEstadoAsistencia?.(alumno._id, "permiso")}
                            className={`px-3 py-2 rounded-lg ${asistencia?.estado === "permiso"
                                ? "bg-yellow-600 text-white"
                                : "bg-yellow-100 text-yellow-600"
                                } hover:bg-yellow-200 transition-colors`}
                        >
                            <TriangleAlert size={20} />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setModalState?.({ type: 'add', selected: alumno })} className="px-3 py-2 rounded-lg bg-blue_principal text-white hover:bg-blue-800 transition-colors">
                        Registrar asistencia
                    </button>
                )}
            </div>
        </div>
    );
}
