"use client";

import { useState } from "react";
import Table from "@/components/Tables/Table";
import { Column, Recomendadores } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus } from "lucide-react";
import { FormModal } from "@/components/Popups/RecomendatorModal";
import { DeleteModal } from "@/components/Popups/DeleteModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecomendadores, addRecomendador, updateRecomendador, deleteRecomendador } from "@/services/recomenders.service";


const ContactInfo = ({ email, telefono }: { email: string; telefono: string }) => (
  <div className="flex flex-col">
    <span>{email}</span>
    <span className="text-gray-500">{telefono}</span>
  </div>
);

export default function RecomendadoresPage() {
  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    selected: Recomendadores | null;
  }>({ type: null, selected: null });

  const queryClient = useQueryClient();

  const {
    data: recomendadores,
    error,
    isLoading,
    isError,
  } = useQuery<Recomendadores[], Error>({
    queryKey: ["recomendadores"],
    queryFn: getRecomendadores,
  });

  const columns: Column<Recomendadores>[] = [
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
    { header: "Nombre", accessor: "nombre" },
    {
      header: "Contacto",
      accessor: (row) => <ContactInfo email={row.email} telefono={row.telefono} />
    },
  ];

  const addRecomendadorMutation = useMutation({
    mutationFn: addRecomendador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recomendadores'] });
    },
  });

  const updateRecomendadorMutation = useMutation({
    mutationFn: updateRecomendador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recomendadores'] });
    },
  });

  const deleteRecomendadorMutation = useMutation({
    mutationFn: deleteRecomendador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recomendadores'] });
    },
  });

  const handleAdd = async (newRecommender: Recomendadores) => {
    newRecommender.image = "http://66.70.189.110/api/uploads/users/default.webp";
    await addRecomendadorMutation.mutateAsync(newRecommender);
    closeModal();
  };

  const handleEdit = async (updated: Recomendadores) => {
    await updateRecomendadorMutation.mutateAsync(updated);
    closeModal();
  };

  const handleDelete = async () => {
    if (!modalState.selected) return;
    await deleteRecomendadorMutation.mutateAsync(modalState.selected._id);
    closeModal();
  };

  const handleShare = (recomendador: Recomendadores) => {
    const subject = `Acceso a plataforma de recomendadores`;
    const body = `Hola ${recomendador.nombre},\n\n` +
      `Aquí están tus credenciales para acceder a la plataforma:\n` +
      `Email: ${recomendador.email}\n` +
      `Contraseña temporal: ${recomendador.password}\n\n` +
      `Accede aquí para activar tu cuenta: ${window.location.origin}/activate/${recomendador._id}\n\n` +
      `Saludos,\nEquipo de soporte`;
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm` +
      `&to=${encodeURIComponent(recomendador.email)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}` +
      `&fs=1`;

    // Abre en nueva pestaña
    window.open(gmailUrl, '_blank');
  };

  const closeModal = () => setModalState({ type: null, selected: null, });

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="p-10">
      <PageHeader
        title="Recomendadores"
        buttons={[
          {
            label: "Nuevo Recomendador",
            icon: <Plus size={18} />,
            onClick: () => setModalState({ type: 'add', selected: null }),
            className: "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
          },
        ]}
      />

      <div className="mt-4 bg-white rounded-lg shadow-md overflow-auto">
        <Table
          data={recomendadores ?? []}
          columns={columns}
          loading={false}
          onEdit={(row) => setModalState({ type: 'edit', selected: row })}
          onDelete={(id) => {
            const selected = recomendadores?.find(r => r._id === id);
            if (selected) {
              setModalState({ type: 'delete', selected });
            }
          }}
          hasShare={true}
          handleShare={handleShare}
        />
      </div>

      <FormModal
        isOpen={modalState.type === 'add'}
        title="Nuevo Recomendador"
        onClose={closeModal}
        onSubmit={handleAdd}
      />

      <FormModal
        isOpen={modalState.type === 'edit'}
        title="Editar Recomendador"
        initialData={modalState.selected!}
        onClose={closeModal}
        onSubmit={handleEdit}
      />

      <DeleteModal<Recomendadores>
        isOpen={modalState.type === 'delete'}
        title="Eliminar Recomendador"
        item={modalState.selected!}
        onClose={closeModal}
        onConfirm={handleDelete}
        description={(item) => (
          <p>
            ¿Estás seguro de eliminar al recomendador{" "}
            <strong className="text-red-600">{item?.nombre}</strong>?
            <br />
            <span className="text-sm text-gray-500">Esta acción no se puede deshacer</span>
          </p>
        )}
      />
    </div>
  );
}
