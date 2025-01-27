"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  buttons?: ReactNode;
}

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  buttons,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 ">
          <h3 className="text-2xl text-blue_principal font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">{children}</div>
        {buttons && <div className="p-4 flex justify-end gap-2">{buttons}</div>}
      </div>
    </div>
  );
};