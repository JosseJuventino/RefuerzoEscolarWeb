"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { FilePublicacion, Image, Publicacion, FileNew } from "@/types/types";
import { toast } from "@pheralb/toast";
import { TextAreaField } from "../Fields/TextAreaField";
import SelectFieldv2 from "../Fields/SelectFielv2";
import { ClipboardList, NotebookTextIcon } from "lucide-react";
import MultiFileSelector from "../Fields/DocumentSelector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDocument } from "@/services/document.service";
import { uploadImage } from "@/services/images.service";
import { addPublication, updatePublication } from "@/services/publish.service";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Publicacion;
    onClose: () => void;
    title: string;
    courseId: string | undefined;
    courseSlug: string | undefined;
}

const optionsCategory = [
    {
        value: "anuncio",
        label: "Anuncio",
        icon: <ClipboardList size={18} className="text-beige_secondary" />,
    },
    {
        value: "guia",
        label: "Guia",
        icon: <NotebookTextIcon size={18} className="text-blue_principal" />,
    },
];

export const AddPublicationModal = ({
    isOpen,
    initialData,
    onClose,
    title,
    courseId,
    courseSlug
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Publicacion>>(
        () => ({
            categoria: "",
            descripcion: "",
            files: [],
            seccionId: courseId,
        }),
        [courseId]
    );

    const [formData, setFormData] = useState<Partial<Publicacion>>(emptyForm);

    const [files, setFiles] = useState<(File | Partial<FileNew>)[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log("initialData", initialData);
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    // Mutaciones para agregar y actualizar
    const addPublicationMutation = useMutation({
        mutationFn: addPublication,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['course', courseSlug]
            });
        },
    });

    // Para actualizar publicación
    const updatePublicationMutation = useMutation({
        mutationFn: updatePublication,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['course', courseSlug] 
            });
        },
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: uploadDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["document"] });
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["image"] });
        },
    });

    // Inicializar el formulario con los datos de edición (si existen)
    useEffect(() => {
        setFormData(initialData || emptyForm);
        setFiles(initialData?.files || []);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof Publicacion, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];
        if (!formData.descripcion?.trim()) {
            errors.push("La descripción no puede quedar vacía");
        }
        if (!formData.categoria?.trim()) {
            errors.push("La categoría no puede quedar vacía");
        }
        return errors;
    };

    // Funciones de carga para imágenes y documentos
    const handleImageUpload = async (file: File): Promise<Partial<FileNew>> => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error({
                text: "Error",
                description: "El archivo no puede ser mayor a 5MB",
            });
            throw new Error("El archivo no puede ser mayor a 5MB");
        }

        const imagen: Image = {
            originalFilename: file.name,
            category: "files_images_section",
            file,
        };

        const response = await uploadImageMutation.mutateAsync(imagen);
        return {
            originalFileName: response.data.fileName,
            url: response.data.url,
            tipo: "imagen",
            id: response.data.imageId,
        };
    };

    const handleDocumentUpload = async (file: File): Promise<Partial<FileNew>> => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error({
                text: "Error",
                description: "El archivo no puede ser mayor a 5MB",
            });
            throw new Error("El archivo no puede ser mayor a 5MB");
        }

        const documento: Partial<FileNew> = {
            originalFileName: file.name,
            file,
            category: "files_documents_section",
        };

        const response = await uploadDocumentMutation.mutateAsync(documento);
        return {
            originalFileName: response.data!.fileName,
            url: response.data!.url,
            tipo: "documento",
            id: response.data!.documentId,
        };
    };

    const processFile = async (file: File | Partial<FileNew>) => {
        if (!(file instanceof File)) return file;

        if (file.size > 5 * 1024 * 1024) {
            toast.error({
                text: "Error",
                description: "El archivo no puede ser mayor a 5MB",
            });
            throw new Error("El archivo no puede ser mayor a 5MB");
        }

        try {
            if (file.type.startsWith("image/")) {
                return await handleImageUpload(file);
            }
            return await handleDocumentUpload(file);
        } catch (error) {
            toast.error({
                text: "Error",
                description: (error as Error).message,
            });
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (formErrors.length > 0) {
            formErrors.forEach((error) =>
                toast.error({ text: "Error", description: error })
            );
            return;
        }

        try {
            const processedFiles = await Promise.all(files.map((file) => processFile(file)));
            const documentArray = processedFiles.filter(Boolean) as FilePublicacion[];

            const submissionData = { ...formData, files: documentArray };
            

            if (initialData && initialData._id) {
                await updatePublicationMutation.mutateAsync(submissionData);

                toast.success({
                    text: "Éxito",
                    description: "La publicación se ha actualizado correctamente",
                });
            } else {
                // Modo agregar: se crea la publicación
                await addPublicationMutation.mutateAsync(submissionData);
                toast.success({
                    text: "Éxito",
                    description: "Se ha agregado la publicación correctamente",
                });
            }

            setFormData(emptyForm);
            handleCancel();
        } catch (error) {
            toast.error({
                text: "Error",
                description: "Ha ocurrido un error procesando tus archivos",
            });
            console.error("Error procesando archivos:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={handleCancel}
            buttons={
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-blue_principal rounded">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue_principal text-white rounded">
                        {initialData && initialData._id ? "Editar" : "Agregar"}
                    </button>
                </div>
            }
        >
            <form
                className="space-y-4 px-6 overflow-y-auto h-96 scroll-smooth"
                onSubmit={handleSubmit}
            >
                <TextAreaField
                    label="Descripción"
                    value={formData.descripcion || ""}
                    onChange={(v) => handleFieldChange("descripcion", v)}
                    placeholder="Descripción de la publicación"
                    isRequired={true}
                />

                <SelectFieldv2
                    label="Categoría"
                    options={optionsCategory}
                    defaultValue={formData.categoria || ""}
                    onChange={(v) => handleFieldChange("categoria", v)}
                />

                <MultiFileSelector initialFiles={formData.files || []} setFiles={setFiles} />
            </form>
        </Modal>
    );
};
