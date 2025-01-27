"use client";

import { useState } from "react";
import Table from "@/components/Tables/Table";
import { Column, Recomendadores } from "@/types/types";
import PageHeader from "@/components/Dashboard/PageHeader";
import { Plus } from "lucide-react";
import { FormModal } from "@/components/Popups/RecomendatorModal";
import { DeleteModal } from "@/components/Popups/DeleteModal";

const initialRecommenders: Recomendadores[] = [
  {
    _id: "1",
    nombre: "Juan Pérez",
    contacto: {
      email: "juan@empresa.com",
      telefono: "+51 987 654 321"
    },
    imagen: "https://i.pinimg.com/736x/5d/b1/2d/5db12d1989c62cc1e63e16b2ff7dc2ca.jpg"
  },
  {
    _id: "2",
    nombre: "María García",
    contacto: {
      email: "maria@consultores.com",
      telefono: "+51 987 123 456"
    },
    imagen: "https://i.pinimg.com/736x/0e/a5/49/0ea549c29cff11577b7652e186d4a1ba.jpg"
  },
  {
    _id: "3",
    nombre: "Carlos López",
    contacto: {
      email: "carlos@innovaciones.com",
      telefono: "+51 987 789 123"
    },
    imagen: "https://i.pinimg.com/736x/64/86/59/6486596e25b4e609a0ec35bf621c71ab.jpg"
  }
];

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
  
  const [recommenders, setRecommenders] = useState<Recomendadores[]>(initialRecommenders);

  const columns: Column<Recomendadores>[] = [
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
    { header: "Nombre", accessor: "nombre" },
    {
      header: "Contacto",
      accessor: (row) => <ContactInfo email={row.contacto.email} telefono={row.contacto.telefono} />
    },
  ];
    
  const handleAdd = (newRecommender: Recomendadores) => {
    setRecommenders(prev => [...prev, {
      ...newRecommender,
      _id: Date.now().toString()
    }]);
    closeModal();
  };

  const handleEdit = (updated: Recomendadores) => {
    setRecommenders(prev => prev.map(r => 
      r._id === updated._id ? updated : r
    ));
    closeModal();
  };

  const handleDelete = () => {
    if (!modalState.selected) return;
    setRecommenders(prev => prev.filter(r => r._id !== modalState.selected?._id));
    closeModal();
  };

  const closeModal = () => setModalState({ type: null, selected: null, });

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
          data={recommenders}
          columns={columns}
          loading={false}
          onEdit={(row) => setModalState({ type: 'edit', selected: row })}
          onDelete={(id) => {
            const selected = recommenders.find(r => r._id === id);
            if (selected) setModalState({ type: 'delete', selected });
          }}
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