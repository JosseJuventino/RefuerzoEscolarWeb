"use client";

import { useState } from "react";
import Table from "@/components/Tables/Table";
import { Column, Tutor } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus } from "lucide-react";
import { DeleteModal } from "@/components/Popups/DeleteModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import { Loading } from "@/components/Loading";
import Image from "next/image";
import { addTeacher, getTeacher } from "@/services/teacher.service";
import { deleteUser } from "@/services/user.service";
import { FormModalTutor } from "@/components/Popups/AddTutorModal";
import CardTeacher from "@/components/CardViews/CardTeacher";
import { Tooltip as ReactTooltip } from "react-tooltip";


const ContactInfo = ({ email, telefono }: { email: string; telefono: string }) => (
    <div className="flex flex-col">
        <span>{email}</span>
        <span className="text-gray-500">{telefono}</span>
    </div>
);

export default function TutorPage() {

    const DEFAULT_IMAGE = "https://refuerzo-mendoza.me/api/uploads/images/users/b706a946-4c4c-4745-b87d-eab8b4883138.webp"


    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: Tutor | null;
    }>({ type: null, selected: null });

    const queryClient = useQueryClient();

    const [isCardView, setIsCardView] = useState(false);

    const {
        data: teachers,
        error,
        isLoading,
        isError,
    } = useQuery<Tutor[], Error>({
        queryKey: ["teacher"],
        queryFn: getTeacher,
    });

    const columns: Column<Tutor>[] = [
        {
            header: "Imagen",
            accessor: (row) => (
                <Image
                    src={row.image}
                    alt={`Avatar de ${row.nombre}`}
                    className="w-10 h-10 rounded-full object-cover"
                    width={300}
                    height={300}
                    quality={100}
                    priority
                />
            )
        },
        { header: "Nombre", accessor: "nombre" },
        {
            header: "Contacto",
            accessor: (row) => <ContactInfo email={row.email} telefono={row.telefono} />
        },
        {
            header: "Secciones",
            accessor: (row) => (
                <div className="flex items-center -space-x-2 hover:space-x-1 transition-spacing cursor-pointer">
                    {row.secciones.slice(0, 3).map((seccion, index) => (
                        <div
                            key={index}
                            className="relative "
                            data-tooltip-id="avatar-tooltip"
                            data-tooltip-content={seccion}
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-sm">
                                <span className="text-xs font-medium text-blue-600">
                                    {seccion.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                        </div>
                    ))}
                    {row.secciones.length > 3 && (
                        <span
                            className="text-sm text-gray-500 ml-2"
                            data-tooltip-id="remaining-tooltip"
                            data-tooltip-content={row.secciones.slice(3).join(', ')}
                        >
                            + {row.secciones.length - 3} más
                        </span>
                    )}
                </div>
            ),
        },
    ];

    const addTutorMutation = useMutation({
        mutationFn: addTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher'] });
        },
    });

    const deleteTutorMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher'] });
        },
    });

    const handleAdd = async (newTutor: Tutor) => {
        newTutor.image = DEFAULT_IMAGE;
        await addTutorMutation.mutateAsync(newTutor);
        closeModal();
    };


    const handleDelete = async () => {
        if (!modalState.selected) return;
        await deleteTutorMutation.mutateAsync(modalState.selected._id);
        closeModal();
    };


    const closeModal = () => setModalState({ type: null, selected: null, });

    if (isLoading) return <Loading />;

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }

    return (
        <div className="p-10">
            <PageHeader
                title="Profesores"
                buttons={[
                    {
                        label: "Nuevo profesor",
                        icon: <Plus size={18} />,
                        onClick: () => setModalState({ type: 'add', selected: null }),
                        className: "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
                    },
                ]}
            />

            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {isCardView ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers?.map((teacher) => (
                        <CardTeacher
                            key={teacher._id}
                            teacher={teacher}
                            setModalState={setModalState}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    <Table
                        data={teachers ?? []}
                        columns={columns}
                        loading={false}
                        hasEdit={false}
                        onDelete={(id) => {
                            const selected = teachers?.find(r => r._id === id);
                            if (selected) {
                                setModalState({ type: 'delete', selected });
                            }
                        }}
                    />
                </div>
            )}


            <FormModalTutor
                isOpen={modalState.type === 'add'}
                title="Nuevo profesor"
                onClose={closeModal}
                onSubmit={handleAdd}
            />


            <DeleteModal<Tutor>
                isOpen={modalState.type === 'delete'}
                title="Eliminar profesor"
                item={modalState.selected!}
                onClose={closeModal}
                onConfirm={handleDelete}
                description={(item) => (
                    <p>
                        ¿Estás seguro de eliminar al tutor{" "}
                        <strong className="text-red-600">{item?.nombre}</strong>?
                        <br />
                        <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
                    </p>
                )}
            />

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
    );
}
