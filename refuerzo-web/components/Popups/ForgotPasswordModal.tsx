import { Dispatch, SetStateAction } from "react";

interface ForgotPasswordModalProps {
    setShowForgotPasswordPopup: Dispatch<SetStateAction<boolean>>;
    setResetEmail: Dispatch<SetStateAction<string>>;
    handleForgotPassword: (e: React.FormEvent) => void;
    resetEmail: string;
    resetLoading: boolean;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
    handleForgotPassword,
    setShowForgotPasswordPopup,
    setResetEmail,
    resetEmail,
    resetLoading,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-blue_principal">Recuperar Contraseña</h3>
                <>
                    <p className="mb-4 text-gray-600">
                        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <form onSubmit={handleForgotPassword}>
                        <div className="mb-4">
                            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="reset-email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="nombre@ejemplo.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue_principal"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowForgotPasswordPopup(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="px-4 py-2 bg-blue_principal text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                            >
                                {resetLoading ? "Enviando..." : "Enviar enlace"}
                            </button>
                        </div>
                    </form>
                </>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;