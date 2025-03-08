import { Lock } from "lucide-react"
import { FieldValues, Path, RegisterOptions, UseFormRegister, UseFormTrigger } from "react-hook-form";
import { FormValues } from "@/types/types";

interface PhoneFieldProps<T extends FieldValues = FormValues> {
    telefono: string;
    handleTelefonoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id?: keyof FormValues;
    placeholder?: string;
    trigger?: UseFormTrigger<T>;
    register?: UseFormRegister<T>;
    validation?: RegisterOptions<T, Path<T>>;
    error?: string;
    label?: string;
}

export function PhoneField({ telefono, handleTelefonoChange, id, placeholder, trigger, register, validation, error, label}: PhoneFieldProps<FormValues>) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                {label || "Teléfono de contacto"}
            </label>
            <div className="flex items-center">
                <span className="px-4 py-3 bg-gray-100 rounded-l-lg border-0 ring-1 ring-gray-200">+503</span>
                <input
                    {...(register ? register(id || "telefono", validation) : {})}
                    id={id || "telefono"}
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder={placeholder || "Teléfono de contacto"}
                    className="w-full px-4 py-3 rounded-r-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    maxLength={8}
                    onBlur={() => trigger && trigger(id || "telefono")}
                />
            </div>
            {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
    )
}