import { UseFormRegister, UseFormTrigger, Path, FieldValues, RegisterOptions } from "react-hook-form";

interface SelectFieldProps<T extends FieldValues> {
    label: string;
    id: Path<T>; // Usa Path<T> en lugar de string
    register: UseFormRegister<T>;
    validation?: RegisterOptions<T, Path<T>>; // Validación específica para el campo
    error?: string;
    trigger: UseFormTrigger<T>;
    options: Array<{ value: string; label: string }>;
}

const SelectField = <T extends FieldValues>({
    label,
    id,
    options,
    register,
    validation,
    error,
    trigger,
}: SelectFieldProps<T>) => (
    <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-[#003C71]">{label}</label>
        <select
            {...register(id, validation)}
            id={id}
            className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none appearance-none"
            defaultValue=""
            onBlur={() => trigger(id)}
        >
            <option value="" disabled>
                Seleccione una opción
            </option>
            {options?.map((option) => (
                <option
                    key={option.value} // Usamos el value como key único
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
        {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
);

export default SelectField;