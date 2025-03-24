"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Estudiante, Grade } from "@/types/types";
import SelectFieldV2 from "../Fields/SelectField2";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../Loading";
import { getGrades } from "@/services/grades.service";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Estudiante;
    onClose: () => void;
    onSubmit: (data: Estudiante) => void;
    title: string;
}

export const ChangeAlumnoSection = ({
    isOpen,
    initialData,
    onClose,
    onSubmit,
    title,
}: FormModalProps) => {

    const emptyForm = useMemo<Partial<Estudiante>>(() => ({
        gradoId: "",
    }), []);

    const [formData, setFormData] = useState<Partial<Estudiante>>(emptyForm);

    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    const {
        data: cursos,
        error,
        isLoading,
        isError,
    } = useQuery<Grade[], Error>({
        queryKey: ["grados"],
        queryFn: getGrades,
    });

    const optionsGrades = useMemo(() => {
        return cursos?.map((c) => ({
            value: c._id,
            label: c.nombre,
            icon: null,
        })) || [];
    }, [cursos]);


    const gradeOfStudent = useMemo(() => {
        return cursos?.find((c) => c.nombre === initialData?.grado);
    }, [cursos, initialData]);

    if (isLoading) return <Loading />;

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }

    const handleFieldChange = (field: keyof Estudiante, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as Estudiante);
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
                <SelectFieldV2
                    label="Grados"
                    options={optionsGrades}
                    defaultValue={gradeOfStudent?._id || ""}
                    onChange={(v) => handleFieldChange("gradoId", v)}
                />
            </form>
        </Modal>
    );
};