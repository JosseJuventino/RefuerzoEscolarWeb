"use client";

import { Modal } from "./Modal";

interface DeleteModalProps<T extends { _id: string }> {
  isOpen: boolean;
  title: string;
  item: T;
  onClose: () => void;
  onConfirm: () => void;
  description: (item: T) => React.ReactNode;
}

export const DeleteModal = <T extends { _id: string }>({
  isOpen,
  item,
  title,
  onClose,
  onConfirm,
  description,
}: DeleteModalProps<T>) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      buttons={
        <>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition duration-200 ease-in-out"
            aria-label="Cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 ease-in-out"
            aria-label="Eliminar"
          >
            Eliminar
          </button>
        </>
      }
    >
      <div className="p-6 text-lg text-gray-700 text-center">
        {description(item)}
      </div>
    </Modal>
  );
};