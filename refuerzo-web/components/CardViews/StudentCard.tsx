import { Estudiante } from "@/types/types";
import { Mail, Phone, Trash2, Repeat2Icon } from "lucide-react";
import Image from "next/image";

interface RecomendadorCardProps {
    alumno: Estudiante;
    setModalState: (modalState: {
        type: 'add' | 'edit' | 'delete' | null;
        selected: Estudiante | null;
    }) => void;
}

export default function CardStudent({ alumno, setModalState }: RecomendadorCardProps) {
    return (
        <div className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-start gap-4">
                <Image
                    src={alumno.image}
                    alt={`Avatar de ${alumno.nombre}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    width={300}
                    height={300}
                    quality={100}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{alumno.nombre}</h3>
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="truncate max-w-[150px] inline-block">
                                {alumno.user.email}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-green-500" />
                            {alumno.user.telefono}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                    <span className="text-xs text-gray-500">Grado:</span>
                    <p className="font-medium text-blue_principal">
                        {alumno.grado}
                    </p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setModalState({ type: 'delete', selected: alumno })}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setModalState({ type: 'edit', selected: alumno })}
                        className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg p-1.5"
                    >
                        <Repeat2Icon size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
}
