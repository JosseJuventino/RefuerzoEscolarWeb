"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Publicacion } from "@/types/types";
import { toast } from "@pheralb/toast";
import { TextAreaField } from "../Fields/TextAreaField";
import SelectFieldv2 from "../Fields/SelectFielv2";
import { ClipboardList, NotebookTextIcon } from "lucide-react";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Publicacion;
    onClose: () => void;
    title: string;
}

const optionsCategory = [
    { value: 'anuncio', label: 'Anuncio', icon: <ClipboardList size={18} className="text-beige_secondary" /> },
    {value: 'guia', label: 'Guia', icon: <NotebookTextIcon size={18} className="text-blue_principal" />},
]

export const AddPublicationModal = ({
    isOpen,
    initialData,
    onClose,
    title,
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Publicacion>>(() => ({
        categoria: "",
        descripcion: "",
        titulo: "",
        files: [],
    }), []);

    const [formData, setFormData] = useState<Partial<Publicacion>>(emptyForm);

    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

     const handleFieldChange = (field: keyof Publicacion, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.descripcion || formData.descripcion.trim() === "") {
            toast.error({
                text: "Error",
                description: "La descripcion no puede quedar vacio",
            })
            return;
        }


        //TODO: Add the rest of the fields
        //onSubmit(formData as Publicacion, null);
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
                        Agregar
                    </button>
                </div>
            }
        >
            <form className="space-y-4 px-6" onSubmit={handleSubmit}>
                <TextAreaField
                    label="Descripcion"
                    value={formData.descripcion || ""}
                    onChange={(v) => handleFieldChange('descripcion', v)}
                    placeholder="Descripcion de la publicacion"
                    isRequired={true}
                />

                <SelectFieldv2 label="categoria" options={optionsCategory} />

            </form>
        </Modal>
    );
};