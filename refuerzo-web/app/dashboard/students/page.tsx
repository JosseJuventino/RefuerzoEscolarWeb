"use client"

import { useState } from "react";
import PageHeader from '@/components/Dashboard/PageHeader'
import Table from '@/components/Tables/Table';
import { deleteAlumno, getAlumnos, updateAlumno } from '@/services/alumnos.service';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Estudiante, Column } from '@/types/types';
import CardStudent from '@/components/CardViews/StudentCard';
import ListGridLayout from "@/components/Dashboard/ListGridLayout";
import { DeleteModal } from "@/components/Popups/DeleteModal";
import { Loading } from "@/components/Loading";
import { ChangeAlumnoSection } from "@/components/Popups/ChangeAlumnoSection";
import { toast } from "@pheralb/toast";
import Image from "next/image";

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

  const queryClient = useQueryClient();

  const deleteAlumnoMutation = useMutation({
    mutationFn: deleteAlumno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });

  const updateAlumnoMutation = useMutation({
    mutationFn: updateAlumno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });


  const ContactInfo = ({ email, telefono }: { email: string; telefono: string }) => (
    <div className="flex flex-col">
      <span>{email}</span>
      <span className="text-gray-500">{telefono}</span>
    </div>
  );

  const handleEdit = async (updated: Partial<Estudiante>) => {
    const payload = {
      _id: updated._id,
      gradoId: updated.gradoId
    };

    if (!payload.gradoId) {
      toast.info({ text: "No se ha realizado ningun cambio" });
      return;
    }

    try {
      toast.loading({
        text: "Actualizando alumno...",
        options: {
          promise: updateAlumnoMutation.mutateAsync(payload),
          success: "Cambio de seccion exitoso",
          error: "Error al actualizar el alumno",
          autoDismiss: true,
          onSuccess: () => {
            closeModal();
            queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
          },
          onError: (error) => {
            console.error("Error de actualización:", error);
          }
        }
      });
    } catch {
      throw new Error("Error al actualizar el alumno");
    }
  };

  const handleDelete = async () => {
    if (!modalState.selected) return;
    try {
      toast.loading({
        text: "Eliminando alumno...",
        options: {
          promise: deleteAlumnoMutation.mutateAsync(modalState.selected._id),
          success: "Alumno eliminado exitosamente",
          error: "Error al eliminar el alumno",
          autoDismiss: true,
          onSuccess: () => {
            closeModal();
            queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
          },
          onError: (error) => {
            console.error("Error de eliminacion:", error);
          }
        }
      });
    } catch {
      throw new Error("Error al eliminar el alumno");
    }
  };

  const closeModal = () => setModalState({ type: null, selected: null, });

  const columns: Column<Estudiante>[] = [
    {
      header: "Imagen",
      accessor: (row) => (
        <Image
          src={row.image}
          alt={`Avatar de ${row.image}`}
          className="w-10 h-10 rounded-full object-cover"
          width={300}
          height={300}
          quality={100}
          priority
        />
      )
    },
    {
      header: "Nombre",
      accessor: (row) => (<span>{row.nombre}</span>),
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

  if (isLoading) return <Loading />;

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
            <div className="mt-4">
              <Table
                data={alumnos ?? []}
                loading={isLoading}
                columns={columns}
                hasMove={true}
                handleMove={(row) => setModalState({ type: 'edit', selected: row })}
                onDelete={(id) => {
                  const selected = alumnos?.find(r => r._id === id);
                  if (selected) {
                    setModalState({ type: 'delete', selected });
                  }
                }}
              />
            </div>
          )
      }

      <ChangeAlumnoSection
        title="Cambiar de grado"
        isOpen={modalState.type === 'edit'}
        onClose={closeModal}
        onSubmit={handleEdit}
        initialData={modalState.selected!}
        key={modalState.selected?._id}
      />

      <DeleteModal<Estudiante>
        isOpen={modalState.type === 'delete'}
        title="Eliminar alumno"
        item={modalState.selected!}
        onClose={closeModal}
        onConfirm={handleDelete}
        description={(item) => (
          <p>
            ¿Estás seguro de eliminar el alumno{" "}
            <strong className="text-red-600">{item?.nombre}</strong>?
            <br />
            <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
          </p>
        )}
      />
    </div>
  )
}
