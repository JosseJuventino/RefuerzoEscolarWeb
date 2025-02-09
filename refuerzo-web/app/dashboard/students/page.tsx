"use client"

import { useState } from "react";
import PageHeader from '@/components/Dashboard/PageHeader'
import Table from '@/components/Tables/Table';
import { getAlumnos } from '@/services/alumnos.service';
import { useQuery } from "@tanstack/react-query";
import { Estudiante, Column } from '@/types/types';
import CardStudent from '@/components/CardViews/StudentCard';
import ListGridLayout from "@/components/Dashboard/ListGridLayout";

export default function Page() {
  const [isCardView, setIsCardView] = useState(false);

  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    selected: Estudiante | null;
  }>({ type: null, selected: null });

  const {
    data: alumnos,
    error,
    isLoading,
    isError,
  } = useQuery<Estudiante[], Error>({
    queryKey: ["estudiantes"],
    queryFn: getAlumnos,
  });

  const ContactInfo = ({ email, telefono }: { email: string; telefono: string }) => (
    <div className="flex flex-col">
      <span>{email}</span>
      <span className="text-gray-500">{telefono}</span>
    </div>
  );


  const columns: Column<Estudiante>[] = [
    {
      header: "Imagen",
      accessor: (row) => (
        <img
          src={row.user.image}
          alt={`Avatar de ${row.user.image}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    },
    {
      header: "Nombre",
      accessor: (row) => (<span>{row.user.nombre}</span> ),
    },

    {
      header: "Contacto",
      accessor: (row) => <ContactInfo email={row.user.email} telefono={row.user.telefono} />
    },

    {
      header: "Grado",
      accessor: "grado"
    },
  ]

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className='p-10'>
      <PageHeader
        title="Alumnos"
      />


      <ListGridLayout isCardView={isCardView} setIsCardView={setIsCardView} />
      {
        isCardView ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumnos?.map((alumno) => (
              <CardStudent
                key={alumno._id}
                alumno={alumno}
                setModalState={setModalState}
              />
            ))}
          </div>
        ) :
          (
            <div className="mt-4 overflow-auto bg-white rounded-lg shadow-md">
              <Table
                data={alumnos ?? []}
                loading={isLoading}
                columns={columns}
                hasMove={true}
                handleMove={() => { }}
                onDelete={(id) => {
                  console.log("Eliminar id: ", id);
                }}
              />
            </div>
          )
      }
    </div>
  )
}
