"use client"

import { Column, Program } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus, BookmarkIcon } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrograms } from "@/services/programs.service";
import { Loading } from "@/components/Loading";

export default function Page() {

    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: Program | null;
    }>({ type: null, selected: null });

    const queryClient = useQueryClient();

    const {
        data: program,
        error,
        isLoading,
        isError,
    } = useQuery<Program[], Error>({
        queryKey: ["programas"],
        queryFn: getPrograms,
    });

    const columns: Column<Program>[] = [
        { header: "Nombre", accessor: "nombre" },
    ];

    if (isLoading) return <Loading />;

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }


    return (
        <div className="p-10">
            <PageHeader
                title="Programas"
                buttons={[
                    {
                        label: "Nuevo Programa",
                        icon: <Plus size={18} />,
                        onClick: () => setModalState({ type: 'add', selected: null }),
                        className: "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
                    },
                ]}
            />

            <table>
                <tbody>
                    {program?.map((programa) => (
                        <tr
                            key={programa._id}
                            className="group hover:bg-gray-50 transition-colors relative"
                        >
                            <td className="p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <BookmarkIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{programa.nombre}</h3>
                                    </div>
                                </div>
                            </td>
                            <td className="text-right pr-6">
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setModalState({ type: 'edit', selected: programa })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => setModalState({ type: 'delete', selected: programa })}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}