"use client";

import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

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
        <div className="w-full flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-300"
            aria-label="Cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            aria-label="Eliminar"
          >
            Eliminar
          </button>
        </div>
      }
    >
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="text-red-600" aria-hidden="true" size={30}/>
        </div>
        <div className="text-lg text-gray-900">
          {description(item)}
        </div>
      </div>
    </Modal>
  );
};