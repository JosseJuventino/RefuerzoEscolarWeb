"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostulants, deletePostulant } from "@/services/applicants.service";
import Table from "@/components/Tables/Table";
import { CompletePostulant, Column } from "@/types/types";
import { useState } from "react";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Share2 } from "lucide-react";
import SharePopup from "@/components/Popups/SharePopup";
import { formatDate } from "@/utils/utils";
import { DeleteModal } from "@/components/Popups/DeleteModal";
import CardPostulante from "@/components/CardViews/PostulantCard";
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import { Loading } from "@/components/Loading";


export default function Applicants() {
    const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
    const [isCardView, setIsCardView] = useState(false);
    const formUrl = "https://refuerzo-mendoza.me/formulario";
    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: CompletePostulant | null;
    }>({ type: null, selected: null });

    const queryClient = useQueryClient();

    const {
        data: postulants,
        error,
        isLoading,
        isError,
    } = useQuery<CompletePostulant[], Error>({
        queryKey: ["postulants"],
        queryFn: getPostulants,
    });

    const ContactInfo = ({ email, telefono }: { email: string; telefono: string }) => (
        <div className="flex flex-col">
            <span>{email}</span>
            <span className="text-gray-500">{telefono}</span>
        </div>
    );


    const closeModal = () => setModalState({ type: null, selected: null, });

    const deletePostulantMutation = useMutation({
        mutationFn: deletePostulant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postulants'] });
        },
    });

    const handleDelete = async () => {
        if (!modalState.selected) return;
        await deletePostulantMutation.mutateAsync(modalState.selected._id);
        closeModal();
    };

    const RecomendadorText = ({ postulante }: { postulante: CompletePostulant }) => (
        <span className="text-center">
            {postulante.recomendador?.nombreCompleto || 'N/A'}
        </span>
    );

    const columns: Column<CompletePostulant>[] = [
        {
            header: "Imagen",
            accessor: (row) => (
                <img
                    src={row.imagen}
                    alt={`Avatar de ${row.nombre}`}
                    className="w-10 h-10 rounded-full object-cover"
                />
            )
        },

        {
            header: "Nombre",
            accessor: "nombre",
        },
        {
            header: "Contacto",
            accessor: (row) => <ContactInfo email={row.email} telefono={row.telefono} />
        },
        {
            header: "Fecha envio",
            accessor: (row) => formatDate(row.createdAt),
        },
        {
            header: "Grado",
            accessor: "grado",
        },

        {
            header: "Recomendador",
            accessor: (row) => <RecomendadorText postulante={row} />,
        }

    ];

    if (isLoading) return <Loading />;

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }



    function handleShareForm() {
        setIsSharePopupOpen(true);
    }

    return (
        <div className="p-7">
            <PageHeader
                title="Postulaciones"
                buttons={[
                    {
                        label: "Compartir formulario",
                        icon: <Share2 size={18} />,
                        onClick: () => handleShareForm(),
                        className: "text-blue_principal bg-white font-medium px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
                    },
                ]}
            />

            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {isCardView ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postulants?.map((postulante) => (
                        <CardPostulante
                            key={postulante._id}
                            postulante={postulante}
                            setModalState={setModalState} // Pasamos la función del estado
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-2 md:mt-4">
                    <Table
                        data={postulants ?? []}
                        loading={isLoading}
                        columns={columns}
                        hasEdit={false}
                        onEdit={(row) => console.log("Editar: ", row)}
                        onDelete={(id) => {
                            const selected = postulants?.find(r => r._id === id);
                            if (selected) setModalState({ type: 'delete', selected });
                        }}
                    />
                </div>
            )}

            <DeleteModal<CompletePostulant>
                isOpen={modalState.type === 'delete'}
                title="Eliminar Postulante"
                item={modalState.selected!}
                onClose={closeModal}
                onConfirm={handleDelete}
                description={(item) => (
                    <p>
                        ¿Estás seguro de eliminar al postulante{" "}
                        <strong className="text-red-600">{item?.nombre}</strong>?
                        <br />
                        <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
                    </p>
                )}
            />

            {isSharePopupOpen && (
                <SharePopup
                    formUrl={formUrl}
                    onClose={() => setIsSharePopupOpen(false)}
                />
            )}

            <div className="fixed bottom-4 right-4 md:hidden z-50">
                <button
                    onClick={handleShareForm}
                    className="bg-blue_principal text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 flex items-center justify-center"
                >
                    <Share2 size={24} />
                    <span className="sr-only">Compartir formulario</span>
                </button>
            </div>

        </div>
    );
}
