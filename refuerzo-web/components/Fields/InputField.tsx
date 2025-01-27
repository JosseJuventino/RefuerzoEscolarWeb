
type FormField = {
    label: string;
    type: string;
    value: string;
    isRequired: boolean;
    placeholder: string;
    onChange: (value: string) => void;
};

export const InputField = ({ label, type, value, onChange, placeholder, isRequired }: FormField) => (
    <div className="space-y-1">
        <label className="block text-medium text-blue_principal font-medium">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-blue_principal outline-none"
            placeholder={placeholder}
            required={isRequired}
        />
    </div>
);
