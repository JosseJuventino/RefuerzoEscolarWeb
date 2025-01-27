"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostulants } from "@/services/applicants.service";
import Table from "@/components/Tables/Table";
import { Postulante, Column } from "@/types/types";
import { useState } from "react";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Share2 } from "lucide-react";
import SharePopup from "@/components/Popups/SharePopup";


export default function Applicants() {
    const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
    const formUrl = "https://your-form-url.com";

    const {
        data: postulants,
        error,
        isLoading,
        isError,
    } = useQuery<Postulante[], Error>({
        queryKey: ["postulants"],
        queryFn: getPostulants,
    });

    const columns: Column<Postulante>[] = [
        {
            header: "Nombre",
            accessor: "nombre",
        },
        {
            header: "Email",
            accessor: "email",
        },
        {
            header: "Año",
            accessor: "año",
        },
        {
            header: "Fecha de Envío",
            accessor: (row: Postulante) =>
                new Date(row.fechaEnvio).toLocaleDateString(),
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
