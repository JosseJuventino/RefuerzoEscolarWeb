"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Program, Recomendadores } from "@/types/types";
import { InputField } from "../Fields/InputField";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Program;
    onClose: () => void;
    onSubmit: (data: Program) => void;
    title: string;
}

export const ProgramModal = ({
    isOpen,
    initialData,
    onClose,
    onSubmit,
    title,
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Program>>(() => ({
        nombre: "",
    }), []);

    const [formData, setFormData] = useState<Partial<Program>>(emptyForm);

    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof Program, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as Recomendadores);
        handleCancel();
    };

    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={handleCancel}
            buttons={
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-blue_principal rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue_principal text-white rounded"
                    >
                        Guardar
                    </button>
                </div>
            }
        >
            <form className="space-y-4 px-6" onSubmit={handleSubmit}>
                <InputField
                    label="Nombre"
                    type="text"
                    value={formData.nombre || ""}
                    onChange={(v) => handleFieldChange('nombre', v)}
                    placeholder="Nombre del programa"
                    isRequired={true}
                />

            </form>
        </Modal>
    );
};