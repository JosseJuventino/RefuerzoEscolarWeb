"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { addPublication } from "@/services/publish.service";

interface FormModalProps {
  isOpen: boolean;
  initialData?: Publicacion;
  onClose: () => void;
  title: string;
  courseId: string | undefined;
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
}: FormModalProps) => {
  // Se recalcula el formulario vacío si courseId cambia
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
  const [selectedFiles, setSelectedFiles] = useState<(File | Partial<FileNew>)[]>(
    []
  );
  const queryClient = useQueryClient();

  const uploadDocumentMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document"] });
    },
  });

  const addPublicationMutation = useMutation({
    mutationFn: addPublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addPublication"] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image"] });
    },
  });

  useEffect(() => {
    setFormData(initialData || emptyForm);
  }, [initialData, emptyForm]);

  const handleFieldChange = useCallback(
    (field: keyof Publicacion, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

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

  // TODO: Considerar mover esta función a un archivo de utilidades
  const handleImageUpload = async (file: File): Promise<Partial<FileNew>> => {
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "El archivo no puede ser mayor a 5MB";
      toast.error({ text: "Error", description: errorMsg });
      throw new Error(errorMsg);
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

  const handleDocumentUpload = async (
    file: File
  ): Promise<Partial<FileNew>> => {
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = "El archivo no puede ser mayor a 10MB";
      toast.error({ text: "Error", description: errorMsg });
      throw new Error(errorMsg);
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

  const processFile = async (
    file: File | Partial<FileNew>
  ): Promise<File | Partial<FileNew>> => {
    if (!(file instanceof File)) return file;

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

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) =>
        toast.error({ text: "Error", description: error })
      );
      return;
    }

    try {
      const processedFiles = await Promise.all(
        selectedFiles.map((file) => processFile(file))
      );

      const publicationPayload = {
        ...formData,
        files: processedFiles.filter(Boolean) as FilePublicacion[],
      };

      await addPublicationMutation.mutateAsync(publicationPayload);
      toast.success({
        text: "Éxito",
        description: "Se ha agregado la publicación correctamente",
      });
        
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
          <button
            onClick={handleCancel}
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
          onChange={(v) => handleFieldChange("categoria", v)}
        />

        <MultiFileSelector
          initialFiles={formData.files || []}
          setFiles={setSelectedFiles}
        />
      </form>
    </Modal>
  );
};
