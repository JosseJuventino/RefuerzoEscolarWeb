import { UseFormRegister, UseFormTrigger, Path, FieldValues, RegisterOptions } from "react-hook-form";

interface InputFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>; // Usa Path<T> en lugar de string
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T, Path<T>>; // Validación específica para el campo
  error?: string;
  trigger: UseFormTrigger<T>;
}

const InputField = <T extends FieldValues>({
  label,
  id,
  type = "text",
  placeholder,
  register,
  validation,
  error,
  trigger,
}: InputFieldProps<T>) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-semibold text-[#003C71]">{label}</label>
    <input
      {...register(id, validation)}
      type={type}
      id={id}
      className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none"
      placeholder={placeholder}
      onBlur={() => trigger(id)}
    />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

export default InputField;