"use client"

import { Column, Program } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPrograms } from "@/services/programs.service";
import { Loading } from "@/components/Loading";
import ProgramCard from "@/components/CardViews/ProgramCard";
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import Table from "@/components/Tables/Table";

export default function Page() {

    const [isCardView, setIsCardView] = useState(false);

    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selected: Program | null;
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


            <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />

            {
                isCardView ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {program?.map((programa) => (
                            <ProgramCard programa={programa} setModalState={setModalState} key={programa._id} />
                        ))}
                    </div>
                ) :
                    (
                        <div className="mt-4 overflow-auto bg-white rounded-lg shadow-md">
                            <Table
                                data={program ?? []}
                                loading={isLoading}
                                columns={columns}
                                hasEdit={false}
                                onEdit={(row) => console.log("Editar: ", row)}
                                onDelete={(id) => {
                                    const selected = program?.find(r => r._id === id);
                                    if (selected) setModalState({ type: 'delete', selected });
                                }}
                            />
                        </div>
                    )
            }
        </div>
    );
}