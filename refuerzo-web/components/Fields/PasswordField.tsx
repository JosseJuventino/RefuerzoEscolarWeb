import { Lock, EyeOff, Eye } from "lucide-react"
import PasswordStrength from "../Auth/PasswordStrenghIndicator";

interface PasswordFieldProps {
    password: string;
    handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    passwordStrength: number;
    showPassword: boolean;
    setShowPassword: (showPassword: boolean) => void;
}

export function PasswordField({ password, handlePasswordChange, passwordStrength, showPassword, setShowPassword }: PasswordFieldProps) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Contraseña
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    onChange={handlePasswordChange}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 rounded-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            <PasswordStrength passwordStrength={passwordStrength} password={password} />
        </div>
    )
}