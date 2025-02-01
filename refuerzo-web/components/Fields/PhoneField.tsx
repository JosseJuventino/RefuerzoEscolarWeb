import { Lock } from "lucide-react"

interface PhoneFieldProps {
    telefono: string;
    handleTelefonoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PhoneField({ telefono, handleTelefonoChange }: PhoneFieldProps) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Teléfono de contacto
            </label>
            <div className="flex items-center">
                <span className="px-4 py-3 bg-gray-100 rounded-l-lg border-0 ring-1 ring-gray-200">+503</span>
                <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="1234 5678"
                    className="w-full px-4 py-3 rounded-r-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    maxLength={8}
                />
            </div>
        </div>
    )
}