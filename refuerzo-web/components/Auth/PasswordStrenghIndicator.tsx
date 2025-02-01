interface PasswordStrengthProps {
    passwordStrength: number;
    password: string;
}

export default function PasswordStrength({ passwordStrength, password }: PasswordStrengthProps) {
    return (
        <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 flex gap-1">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-all ${password.length === 0
                            ? "bg-gray-200" 
                            : passwordStrength === 0
                                ? i === 0
                                    ? "bg-red-500" 
                                    : "bg-gray-200" 
                                : passwordStrength === 1
                                    ? i < 2
                                        ? "bg-yellow-500" 
                                        : "bg-gray-200" 
                                    : "bg-green-500"
                            }`}
                    />
                ))}
            </div>
            <span className="text-sm font-medium">
                {password.length === 0
                    ? ""
                    : passwordStrength === 0
                        ? "Débil"
                        : passwordStrength === 1
                            ? "Medio"
                            : "Fuerte"}
            </span>
        </div>
    )
}