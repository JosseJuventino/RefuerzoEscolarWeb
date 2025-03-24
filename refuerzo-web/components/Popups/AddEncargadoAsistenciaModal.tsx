"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { AsistenciaEncargado } from "@/types/types";
import SelectFieldV2 from "../Fields/SelectField2";
import { X, CheckIcon, TriangleAlert } from "lucide-react";
import { DatePicker } from "@heroui/date-picker";
import { DateValue as ValueDate, getLocalTimeZone, today } from "@internationalized/date";
import { TimeInput, TimeInputValue } from "@heroui/date-input";
import { toast } from "@pheralb/toast";

interface FormModalProps {
    isOpen: boolean;
    initialData?: AsistenciaEncargado;
    onClose: () => void;
    onSubmit: (data: AsistenciaEncargado) => void;
    title: string;
}

const optionsCategory = [
    {
        value: "falto",
        label: "falto",
        icon: (
            <div className="p-1 bg-red-100 rounded-full">
                <X size={18} className="text-red-500" />
            </div>
        ),
    },
    {
        value: "asistio",
        label: "Asistió",
        icon: (
            <div className="p-1 bg-green-100 rounded-full">
                <CheckIcon size={18} className="text-green-500" />
            </div>
        ),
    },
    {
        value: "permiso",
        label: "Permiso",
        icon: (
            <div className="p-1 bg-yellow-100 rounded-full">
                <TriangleAlert size={18} className="text-yellow-500" />
            </div>
        ),
    },
];

export const FormAsistenciaEncargado = ({
    isOpen,
    initialData,
    onClose,
    onSubmit,
    title,
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<AsistenciaEncargado>>(
        () => ({
            userId: "",
            fecha: "",
            estado: "",
            hora_inicio: "",
            hora_fin: "",
        }),
        []
    );

    const [date, setDate] = useState<ValueDate | null>(today(getLocalTimeZone()) as ValueDate);
    const [hora_inicio, setHoraInicio] = useState<TimeInputValue | null>(null);
    const [hora_fin, setHoraFin] = useState<TimeInputValue | null>(null);
    const [formData, setFormData] = useState<Partial<AsistenciaEncargado>>(emptyForm);
    const [error, setError] = useState<string | null>(null);
    const [isTodayAsistencia, setIsTodayAsistencia] = useState<boolean>(false);

    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof AsistenciaEncargado, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        setError(null);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (error) return;

        formData.fecha = date ? date.toString() : "";
        formData.hora_inicio = hora_inicio ? hora_inicio.toString() : "";
        formData.hora_fin = hora_fin ? hora_fin.toString() : "";

        const asistioHoy = formData.estado === "asistio";

        if (!asistioHoy) {
            formData.hora_inicio = "00:00:00";
            formData.hora_fin = "00:00:00";
        }

        if (asistioHoy && (!formData.hora_inicio || !formData.hora_fin)) {
            toast.error({ text: "Debes completar todos los campos" });
            return;
        }

        if (isTodayAsistencia && !formData.fecha) {
            toast.error({ text: "Debes seleccionar una fecha" });
            return;
        }

        if (asistioHoy && (formData.hora_inicio > formData.hora_fin || formData.hora_fin === formData.hora_inicio)) {
            toast.error({ text: "la hora de inicio debe ser menor a la hora de salida" });
            return;
        }

        onSubmit(formData as AsistenciaEncargado);
        handleCancel();
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
                        Guardar
                    </button>
                </div>
            }
        >
            <form className="space-y-4 px-6" onSubmit={handleSubmit}>
                <SelectFieldV2
                    label="Estado"
                    options={optionsCategory}
                    onChange={(v) => handleFieldChange("estado", v)}
                />

                <label htmlFor="isTodayAsistencia" className="text-md mr-2 text-blue_principal">
                    Llenar asistencia de hoy
                </label>

                <input
                    type="checkbox"
                    name="isTodayAsistencia"
                    id="isTodayAsistencia"
                    checked={isTodayAsistencia}
                    onChange={(e) => {
                        setIsTodayAsistencia(e.target.checked)
                        if (e.target.checked) {
                            setDate(today(getLocalTimeZone()) as ValueDate);
                        }
                    }}
                />

                <DatePicker
                    className="w-full hover:bg-white"
                    granularity="day"
                    variant="flat"
                    isDisabled={isTodayAsistencia}
                    label="Fecha de asistencia"
                    value={date}
                    defaultValue={today(getLocalTimeZone())}
                    onChange={setDate}
                />

                <div className="flex flex-row justify-between gap-4">
                    <TimeInput
                        variant="flat"
                        label="Hora de entrada"
                        isDisabled={formData.estado === "falto" || formData.estado === "permiso"}
                        value={hora_inicio}
                        onChange={setHoraInicio}
                    />
                    <TimeInput
                        variant="flat"
                        label="Hora de salida"
                        isDisabled={formData.estado === "falto" || formData.estado === "permiso"}
                        value={hora_fin}
                        onChange={setHoraFin}
                    />
                </div>
            </form>
        </Modal>
    );
};