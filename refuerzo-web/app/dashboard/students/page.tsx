"use client"

import PageHeader from '@/components/Dashboard/PageHeader'
import Table from '@/components/Tables/Table';
import { getAlumnos } from '@/services/alumnos.service';
import { useQuery } from "@tanstack/react-query";
import { Estudiante, Column } from '@/types/types';

export default function Page() {

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
          src={row.image}
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

      <div className="overflow-auto bg-white rounded-lg shadow-md">
        <Table
          data={alumnos ?? []}
          loading={isLoading}
          columns={columns}
          hasEdit={true}
          onEdit={(row) => {
            console.log("Editar: ", row);
          }}
          onDelete={(id) => {
            console.log("Eliminar id: ", id);
          }}
        />
      </div>
    </div>
  )
}
