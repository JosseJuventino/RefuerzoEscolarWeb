"use client";

import { Modal } from "./Modal";

interface DeleteModalProps<T extends { _id: string }> {
    isOpen: boolean
    title: string
    item: T
    onClose: () => void
    onConfirm: () => void
    description: (item: T) => React.ReactNode
}

export const DeleteModal = <T extends { _id: string }>({
  isOpen,
  item,
  title,
  onClose,
  onConfirm,
  description
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
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </>
      }
    >
      <div className="p-4">
        {description(item)}
      </div>
    </Modal>
  );
};