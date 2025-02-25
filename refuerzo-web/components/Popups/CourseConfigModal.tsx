"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Course } from "@/types/types";
import { InputField } from "../Fields/InputField";
import { ImageSelector } from "../Fields/ImageSelector"
import { toast } from "@pheralb/toast";


interface FormModalProps {
    isOpen: boolean;
    initialData?: Course;
    onClose: () => void;
    onSubmit: (data: Course, image: File | string | null) => void;
    title: string;
}

export const CourseConfigModal = ({
    isOpen,
    initialData,
    onClose,
    onSubmit,
    title,
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Course>>(() => ({
        nombre: "",
    }), []);

    const [formData, setFormData] = useState<Partial<Course>>(emptyForm);
    const [imageFile, setImageFile] = useState<File | string | null>(null);

    const handleImageChange = (file: File | string | null) => {
        setImageFile(file);
    };


    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof Course, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre || formData.nombre.trim() === "") {
            toast.error({
                text: "Error",
                description: "EL nombre no puede quedar vacio",
            })
            return;
        }

        onSubmit(formData as Course, imageFile);
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
                <InputField
                    label="Nombre"
                    type="text"
                    value={formData.nombre || ""}
                    onChange={(v) => handleFieldChange('nombre', v)}
                    placeholder="Nombre del programa"
                    isRequired={true}
                />


                <ImageSelector
                    initialPreview={formData.backgroundImage}
                    onImageChange={handleImageChange}
                />



            </form>
        </Modal>
    );
};