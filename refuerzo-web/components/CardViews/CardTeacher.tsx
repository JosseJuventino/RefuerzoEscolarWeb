import { Teacher } from "@/types/types";
import { Mail, Phone, Trash2 } from "lucide-react";
import Image from "next/image";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface TutorCardProps {
    teacher: Teacher;
    setModalState: (modalState: {
        type: 'add' | 'edit' | 'delete' | null;
        selected: Teacher | null;
    }) => void;
}

export default function CardTeacher({ teacher, setModalState }: TutorCardProps) {
    return (
        <div className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-start gap-4">
                <Image
                    src={teacher.image}
                    alt={`Avatar de ${teacher.nombre}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    width={56}
                    height={56}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold truncate max-w-[150px] inline-block text-blue_principal">{teacher.nombre}</h3>
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="truncate max-w-[150px] inline-block">
                                {teacher.email}
                           </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-green-500" />
                            {teacher.telefono}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-wrap gap-1 text-white/90 text-sm">
                        {teacher.secciones.map((seccion, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue_principal rounded-full backdrop-blur-sm hover:bg-black/30 transition-colors"
                                data-tooltip-id="professor-tooltip"
                                data-tooltip-content={seccion}
                            >
                                {seccion.split(' ').map(n => n[0]).join('')}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => setModalState({ type: 'delete', selected: teacher })}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                </div>

                <ReactTooltip
                    id="professor-tooltip"
                    className="z-50"
                    place="top"
                />
                <ReactTooltip
                    id="avatar-tooltip"
                    className="z-50"
                    place="top"
                />
                <ReactTooltip
                    id="remaining-tooltip"
                    className="z-50"
                    place="top"
                />
            </div>
        </div>
    );
}
