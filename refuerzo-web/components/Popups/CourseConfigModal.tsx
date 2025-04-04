"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Course } from "@/types/types";
import { InputField } from "../Fields/InputField";
import { ImageSelector } from "../Fields/ImageSelector";
import { toast } from "@pheralb/toast";
import SelectFieldMultiple from "@/components/Fields/SelectFieldMultiple";
import { getTutorsWithoutPagination } from "@/services/tutors.service";
import { getTeacher } from "@/services/teacher.service";

interface FormModalProps {
  isOpen: boolean;
  initialData?: Course;
  onClose: () => void;
  title: string;
  onSubmit: (data: Course, image: File | string | null) => void;
}

export const CourseConfigModal = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
  title,
}: FormModalProps) => {
  const emptyForm = useMemo<Partial<Course>>(
    () => ({
      nombre: "",
      encargados: [],
    }),
    []
  );

  const [formData, setFormData] = useState<Partial<Course>>(emptyForm);
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [tutors, setTutors] = useState<{ value: string; label: string; image: string; email: string; telefono: string }[]>([]); // Estado para tutores
  const [teachers, setTeachers] = useState<{ value: string; label: string; image: string; email: string; telefono: string }[]>([]); // Estado para profesores
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  // Obtener tutores desde la API
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await getTutorsWithoutPagination();
        const mappedTutors = response.map((tutor) => ({
          value: tutor._id,
          label: tutor.nombre,
          image: tutor.image || "",
          email: tutor.email || "",
          telefono: tutor.telefono || "",
        }));
        setTutors(mappedTutors);
      } catch (error) {
        console.error("Error fetching tutors:", error);
        toast.error({
          text: "Error",
          description: "No se pudieron cargar los tutores.",
        });
      }
    };

    fetchTutors();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getTeacher();
        const mappedTeachers = response.map((teacher) => ({
          value: teacher._id,
          label: teacher.nombre,
          image: teacher.image || "",
          email: teacher.email || "",
          telefono: teacher.telefono || "",
        }));
        setTeachers(mappedTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error({
          text: "Error",
          description: "No se pudieron cargar los profesores.",
        });
      }
    };

    fetchTeachers();
  }, []);

  const handleImageChange = (file: File | string | null) => {
    setImageFile(file);
  };

  useEffect(() => {
    if (initialData?.encargados) {
      initialData.encargados.forEach((encargado) => {
        const encargadoId = typeof encargado === 'string' ? encargado : encargado._id;

        if (tutors.find((tutor) => tutor.value === encargadoId)) {
          setSelectedTutors((prev) => [...prev, encargadoId]);
        } else if (teachers.find((teacher) => teacher.value === encargadoId)) {
          setSelectedTeachers((prev) => [...prev, encargadoId]);
        }
      });
    }
    setFormData(initialData || emptyForm);
  }, [initialData, emptyForm, tutors, teachers]);

  const handleFieldChange = (field: keyof Course, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTutorsChange = (values: string[]) => {
    setSelectedTutors(values);
  };

  const handleTeachersChange = (values: string[]) => {
    setSelectedTeachers(values);
  };

  const combineIds = () => {
    const selectedTutorObjects = tutors
      .filter(tutor => selectedTutors.includes(tutor.value))
      .map(tutor => ({
        _id: tutor.value,
        nombre: tutor.label,
        image: tutor.image,
        email: tutor.email,
        telefono: tutor.telefono
      }));

    const selectedTeacherObjects = teachers
      .filter(teacher => selectedTeachers.includes(teacher.value))
      .map(teacher => ({
        _id: teacher.value,
        nombre: teacher.label,
        image: teacher.image,
        email: teacher.email,
        telefono: teacher.telefono
      }));

    return [...selectedTutorObjects, ...selectedTeacherObjects];
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setSelectedTutors([]);
    setSelectedTeachers([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || formData.nombre.trim() === "") {
      toast.error({
        text: "Error",
        description: "El nombre no puede quedar vacio",
      })
      return;
    }

    const combinedData = combineIds();
    formData.encargados = combinedData;

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
          onChange={(v) => handleFieldChange("nombre", v)}
          placeholder="Nombre del programa"
          isRequired={true}
        />

        <SelectFieldMultiple
          label="Selecciona Tutores"
          options={tutors.map((tutor) => ({ value: tutor.value, label: tutor.label }))}
          onChange={handleTutorsChange}
          defaultValues={selectedTutors}
        />

        <SelectFieldMultiple
          label="Selecciona Profesores"
          options={teachers.map((teacher) => ({ value: teacher.value, label: teacher.label }))}
          onChange={handleTeachersChange}
          defaultValues={selectedTeachers}
        />

        <ImageSelector
          initialPreview={formData.backgroundImage}
          onImageChange={handleImageChange}
        />
      </form>
    </Modal>
  );
};