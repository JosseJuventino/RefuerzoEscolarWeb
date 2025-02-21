import { Grade } from "@/types/types";
import { GraduationCap, Trash2, Edit2 } from "lucide-react";

interface CardGradeProps {
    grado: Grade;
    setModalState: (modalState: {
        type: 'add' | 'edit' | 'delete' | null;
        selected: Grade | null;
    }) => void;
}

export default function GradeCard({ grado, setModalState }: CardGradeProps) {
    return (
        <div
            key={grado._id}
            className="group hover:bg-gray-50 flex flex-row items-center gap-4 transition-colors relative"
        >
            <div className="p-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">{grado.nombre}</h3>
                    </div>
                </div>
            </div>
            <div className="tpr-6">
                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setModalState({ type: 'edit', selected: grado })}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button
                        onClick={() => setModalState({ type: 'delete', selected: grado })}
                        className="text-red-600 hover:text-red-800"
                    >
                        <Trash2 />
                    </button>
                </div>
            </div>
        </div>

    )
}
