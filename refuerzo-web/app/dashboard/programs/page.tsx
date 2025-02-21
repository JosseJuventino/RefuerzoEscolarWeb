"use client"

import { Column, PartialProgram, Program } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrograms, addProgram, deleteProgram, updateProgram } from "@/services/programs.service";
import { Loading } from "@/components/Loading";
import ProgramCard from "@/components/CardViews/ProgramCard";
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import Table from "@/components/Tables/Table";
import { ProgramModal } from "@/components/Popups/ProgramModal";
import { DeleteModal } from "@/components/Popups/DeleteModal";

export default function Page() {

    const [isCardView, setIsCardView] = useState(false);

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

    const addProgramMutation = useMutation({
        mutationFn: addProgram,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programas'] });
        },
    });

    const deleteProgramMutation = useMutation({
        mutationFn: deleteProgram,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programas'] });
        },
    });

    const updateProgramMutation = useMutation({
        mutationFn: updateProgram,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programas'] });
        },
    });

    const columns: Column<Program>[] = [
        { header: "Nombre", accessor: "nombre" },
    ];

    if (isLoading) return <Loading />;

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }


    const handleAdd = async (Newprograma: PartialProgram) => {
        await addProgramMutation.mutateAsync(Newprograma);
        closeModal();
    };

    const handleDelete = async () => {
        if (!modalState.selected) return;
        await deleteProgramMutation.mutateAsync(modalState.selected._id);
        closeModal();
    };

    const handleEdit = async (programa: Program) => {
        await updateProgramMutation.mutateAsync(programa);
        closeModal();
    }


    const closeModal = () => setModalState({ type: null, selected: null, });


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


            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {isCardView ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {program?.map((programa) => (
                        <ProgramCard programa={programa} setModalState={setModalState} key={programa._id} />
                    ))}
                </div>
            ) :
                (
                    <div className="mt-4 ">
                        <Table
                            data={program ?? []}
                            loading={isLoading}
                            columns={columns}
                            hasEdit={true}
                            onEdit={(row) => setModalState({ type: 'edit', selected: row })}
                            onDelete={(id) => {
                                const selected = program?.find(r => r._id === id);
                                if (selected) setModalState({ type: 'delete', selected });
                            }}
                        />
                    </div>
                )
            }

            <ProgramModal
                isOpen={modalState.type === 'add'}
                title="Nuevo Programa"
                onClose={closeModal}
                onSubmit={handleAdd}
            />

            <ProgramModal
                isOpen={modalState.type === 'edit'}
                title="Editar Programa"
                onClose={closeModal}
                onSubmit={handleEdit}
                initialData={modalState.selected!}
            />


            <DeleteModal<Program>
                isOpen={modalState.type === 'delete'}
                title="Eliminar Recomendador"
                item={modalState.selected!}
                onClose={closeModal}
                onConfirm={handleDelete}
                description={(item) => (
                    <p>
                        ¿Estás seguro de eliminar el programa{" "}
                        <strong className="text-red-600">{item?.nombre}</strong>?
                        <br />
                        <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
                    </p>
                )}
            />

        </div>
    );
}