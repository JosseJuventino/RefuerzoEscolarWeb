"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostulants } from "@/services/applicants.service";
import Table from "@/components/Tables/Table";
import { Postulante, Column } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus } from "lucide-react";

export default function Applicants() {
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
            header: "Estado",
            accessor: "estado",
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

    return (
        <div className="p-10">
            <PageHeader
                title="Postulantes"
                buttons={[
                    {
                        label: "Agregar",
                        icon: <Plus />,
                        onClick: () => console.log("Agregar"),
                        className:
                            "bg-blue_principal hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-transform transform hover:scale-105 focus:outline-none",
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
        </div>
    );
}
