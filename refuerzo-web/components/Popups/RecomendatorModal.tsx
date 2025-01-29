"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Recomendadores } from "@/types/types";
import { InputField } from "../Fields/InputField";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Recomendadores;
    onClose: () => void;
    onSubmit: (data: Recomendadores) => void;
    title: string;
}


export const FormModal = ({
    isOpen,
    initialData,
    onClose,
    onSubmit,
    title,
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Recomendadores>>(() => ({
        nombre: "",
        contacto: { email: "", telefono: "" },
        imagen: "",
    }), []);

    const [formData, setFormData] = useState<Partial<Recomendadores>>(emptyForm);



    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof Recomendadores, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactoChange = (
        field: keyof Recomendadores['contacto'],
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            contacto: {
                ...(prev.contacto || { email: "", telefono: "" }),
                [field]: value
            }
        }));
    };

    const handleCancel = () => {
        setFormData(emptyForm); // Limpia los campos
        onClose(); // Cierra el modal
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as Recomendadores);
        onClose();
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
            <form className="space-y-4" onSubmit={handleSubmit}>
                <InputField
                    label="Nombre"
                    type="text"
                    value={formData.nombre || ""}
                    onChange={(v) => handleFieldChange('nombre', v)}
                    placeholder="Nombre del recomendador"
                    isRequired={true}
                />

                <InputField
                    label="Email"
                    type="email"
                    value={formData.contacto?.email || ""}
                    onChange={(v) => handleContactoChange('email', v)}
                    placeholder="Email del recomendador"
                    isRequired={true}
                />

                <InputField
                    label="Teléfono"
                    type="tel"
                    value={formData.contacto?.telefono || ""}
                    onChange={(v) => handleContactoChange('telefono', v)}
                    placeholder="Teléfono del recomendador"
                    isRequired={false}
                />
            </form>
        </Modal>
    );
};