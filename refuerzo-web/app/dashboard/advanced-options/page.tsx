"use client"

import GradeCard from "@/components/CardViews/GradeCard";
import ProgramCard from "@/components/CardViews/ProgramCard";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Loading } from "@/components/Loading";
import { DeleteModal } from "@/components/Popups/DeleteModal";
import { GradeModal } from "@/components/Popups/GradeModal";
import { ProgramModal } from "@/components/Popups/ProgramModal";
import { addGrade, deleteGrade, getGrades, updateGrade } from "@/services/grades.service";
import { addProgram, deleteProgram, getPrograms, updateProgram } from "@/services/programs.service";
import { Grade, PartialGrade, PartialProgram, Program } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AdvancedOptions() {

    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: Program | null;
    }>({ type: null, selected: null });

    const [modalStateGrade, setModalStateGrade] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: Grade | null;
    }>({ type: null, selected: null });


    const {
        data: program,
        error,
        isLoading,
        isError,
    } = useQuery<Program[], Error>({
        queryKey: ["programas"],
        queryFn: getPrograms,
    });

    const {
        data: grade,
    } = useQuery<Grade[], Error>({
        queryKey: ["grados"],
        queryFn: getGrades,
    });

    const queryClient = useQueryClient();

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

    const addGradeMutation = useMutation({
        mutationFn: addGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grados'] });
        },
    });

    const deleteGradeMutation = useMutation({
        mutationFn: deleteGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grados'] });
        },
    });

    const updateGradeMutation = useMutation({
        mutationFn: updateGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grados'] });
        },
    });

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

    const handleAddGrade = async (newGrade: PartialGrade) => {
        await addGradeMutation.mutateAsync(newGrade);
        closeModal();
    };

    const handleDeleteGrade = async () => {
        if (!modalStateGrade.selected) return;
        await deleteGradeMutation.mutateAsync(modalStateGrade.selected._id);
        closeModal();
    };

    const handleEditGrade = async (grade: Grade) => {
        await updateGradeMutation.mutateAsync(grade);
        closeModal();
    }

    const closeModal = () => {
        setModalState({ type: null, selected: null, })
        setModalStateGrade({ type: null, selected: null, })
    };

    return (
        <div className="p-7">
            <PageHeader
                title="Opciones Avanzadas"
            />

            {/* Programas educativos */}
            <section>
                <div className="flex justify-between items-center">
                    <h3 className="text-blue_principal font-bold text-lg">Programas educativos</h3>
                    <button
                        onClick={() => setModalState({ type: 'add', selected: null })}
                        className="text-blue_principal bg-white font-medium px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
                    >
                        Agregar Nuevo Programa
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {program?.map((programa) => (
                        <ProgramCard programa={programa} setModalState={setModalState} key={programa._id} />
                    ))}
                </div>

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
                    title="Eliminar Programa"
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
            </section>

            {/* Grados */}
            <section className="mt-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-blue_principal font-bold text-lg">Grados</h3>
                    <button
                        onClick={() => setModalStateGrade({ type: 'add', selected: null })}
                        className="text-blue_principal bg-white font-medium px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
                    >
                        Agregar nuevo grado
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {grade?.map((grade) => (
                        <GradeCard grado={grade} setModalState={setModalStateGrade} key={grade._id} />
                    ))}
                </div>

                <GradeModal
                    isOpen={modalStateGrade.type === 'add'}
                    title="Nuevo Grado"
                    onClose={closeModal}
                    onSubmit={handleAddGrade}
                />

                <GradeModal
                    isOpen={modalStateGrade.type === 'edit'}
                    title="Editar Grado"
                    onClose={closeModal}
                    onSubmit={handleEditGrade}
                    initialData={modalStateGrade.selected!}
                />

                <DeleteModal<Grade>
                    isOpen={modalStateGrade.type === 'delete'}
                    title="Eliminar Grado"
                    item={modalStateGrade.selected!}
                    onClose={closeModal}
                    onConfirm={handleDeleteGrade}
                    description={(item) => (
                        <p>
                            ¿Estás seguro de eliminar el grado{" "}
                            <strong className="text-red-600">{item?.nombre}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
                        </p>
                    )}
                />

            </section>
        </div>
    )
}