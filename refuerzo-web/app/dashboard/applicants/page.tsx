"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostulants } from "@/services/applicants.service";
import Table from "@/components/Tables/Table";
import { Postulante, Column } from "@/types/types";
import { useState } from "react";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Share2 } from "lucide-react";
import SharePopup from "@/components/Popups/SharePopup";
import { formatDate } from "@/utils/utils";


export default function Applicants() {
    const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
    const formUrl = "https://refuerzo-mendoza.me/formulario";

    const {
        data: postulants,
        error,
        isLoading,
        isError,
    } = useQuery<Postulante[], Error>({
        queryKey: ["postulants"],
        queryFn: getPostulants,
    });

    const ContactInfo = ({ email, telefono }: { email: string; telefono: string }) => (
        <div className="flex flex-col">
            <span>{email}</span>
            <span className="text-gray-500">{telefono}</span>
        </div>
    );

    const columns: Column<Postulante>[] = [
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
        
    ];

    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }
    function handleShareForm() {
        setIsSharePopupOpen(true);
    }

    return (
        <div className="p-10">
            <PageHeader
                title="Postulaciones"
                buttons={[
                    {
                        label: "Compartir formulario",
                        icon: <Share2 />,
                        onClick: () => handleShareForm(),
                        className:
                            "text-blue_principal bg-white font-medium px-4 py-2 rounded-lg shadow transition-transform transform hover:scale-105 focus:outline-none",
                    },
                ]}

            />
            <div className="overflow-auto bg-white rounded-lg shadow-md">
                <Table
                    data={postulants ?? []}
                    loading={isLoading}
                    columns={columns}
                    onEdit={(row) => {
                        console.log("Editar: ", row);
                    }}
                    onDelete={(id) => {
                        console.log("Eliminar id: ", id);
                    }}
                />
            </div>

            {isSharePopupOpen && (
                <SharePopup
                    formUrl={formUrl}
                    onClose={() => setIsSharePopupOpen(false)}
                />
            )}

        </div>
    );
}
