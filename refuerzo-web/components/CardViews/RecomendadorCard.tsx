import { Recomendadores } from "@/types/types";
import { Mail, Phone, Trash2, Edit2 } from "lucide-react";
import Image from "next/image";

interface RecomendadorCardProps {
    recomendador: Recomendadores;
    setModalState: (modalState: {
        type: 'add' | 'edit' | 'delete' | null;
        selected: Recomendadores | null;
    }) => void;
}

export default function CardRecomendador({ recomendador, setModalState }: RecomendadorCardProps) {
    return (
        <div className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-start gap-4">
                <Image
                    src={recomendador.image}
                    alt={`Avatar de ${recomendador.nombre}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    width={56}
                    height={56}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{recomendador.nombre}</h3>
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            {recomendador.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-green-500" />
                            {recomendador.telefono}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                    <span className="text-xs text-gray-500">Postulantes recomendados:</span>
                    <p className="font-medium text-blue_principal">
                        {recomendador.postulantesCount}
                    </p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setModalState({ type: 'delete', selected: recomendador })}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setModalState({ type: 'edit', selected: recomendador })}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg p-1.5"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
