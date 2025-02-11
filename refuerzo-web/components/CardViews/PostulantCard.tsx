import { CompletePostulant } from "@/types/types";
import { formatDate } from "@/utils/utils";
import { Mail, Phone, Trash2 } from "lucide-react";

interface CardPostulanteProps {
    postulante: CompletePostulant;
    setModalState: (modalState: {
        type: 'add' | 'edit' | 'delete' | null;
        selected: CompletePostulant | null;
    }) => void;
}

export default function CardPostulante({ postulante, setModalState }: CardPostulanteProps) {
    return (
        <div className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-start gap-4">
                <img
                    src={postulante.imagen}
                    alt={`Avatar de ${postulante.nombre}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    width={56}
                    height={56}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{postulante.nombre}</h3>
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            {postulante.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-green-500" />
                            {postulante.telefono}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="block text-xs text-gray-500 mb-1">Fecha de envío</span>
                    {formatDate(postulante.createdAt)}
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="block text-xs text-gray-500 mb-1">Grado</span>
                    {postulante.grado}
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                    <span className="text-xs text-gray-500">Recomendado por:</span>
                    <p className="text-sm font-medium">
                        {postulante.recomendador?.nombreCompleto || 'N/A'}
                    </p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setModalState({ type: 'delete', selected: postulante })}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
