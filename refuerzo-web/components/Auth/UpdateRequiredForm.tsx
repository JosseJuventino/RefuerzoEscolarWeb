'use client'


import { useState, useRef, useEffect } from "react";
import { PasswordField } from "../Fields/PasswordField";
import { ImagePreview } from "./ImagePreview";
import { CameraPreview } from "./CameraPreview";
import IndicatorStepFinish from "./IndicatorStep";
import { UploadButton } from "../Fields/UploadButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base64ToFile } from "@/utils/base64ToFile";
import { useAuthStore } from "@/stores/authStore";
import { Image, ActivateAccountRequirements } from "@/types/types";
import { uploadImage } from "@/services/images.service";
import { activeProfile } from "@/services/user.service";
import { PhoneField } from "../Fields/PhoneField";
import { useCamera } from "@/hooks/useCamera";
import { toast } from "@pheralb/toast";
import { signOut } from "next-auth/react";


interface UpdateRequiredFormProps {
    username: string | undefined | null;
}

const UpdateRequiredForm: React.FC<UpdateRequiredFormProps> = ({ username }) => {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [activationStatus, setActivationStatus] = useState<"idle" | "success" | "error">("idle");
    const queryClient = useQueryClient();
    const handleLogout = () => signOut({ callbackUrl: '/' });

    const formData = useRef({
        imagen: "",
        telefono: "",
        password: "",
    });


    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    const { cameraActive, startCamera, stopCamera, videoRef, canvasRef, handleTakePhoto, handleFileChange, handleRetakePhoto } = useCamera(isMobile, setPreview, formData);

    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        formData.current.telefono = `+503${telefono}`;
    }, [telefono]);

    useEffect(() => {
        formData.current.password = password;
    }, [password]);

    const handleNext = () => {
        if (!formData.current.imagen) {
            toast.error({ text: "Debes subir una imagen de perfil" });
        }
        setStep(step + 1);
    };
    const handlePrevious = () => setStep(step - 1);

    const validatePassword = (password: string): number => {
        const minLength = 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return 0;
        if (hasLetter && hasNumber && hasSpecialChar) return 2;
        if (hasLetter && hasNumber) return 1;
        return 0;
    };

    const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            setTelefono(value);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordStrength(validatePassword(value));
    }

    const activateAccountMutator = useMutation({
        mutationFn: activeProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['image'] });
        },
    });

    const uploadImageMutator = useMutation({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['image'] });
        },
    });

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const handleFinish = async () => {

        if (telefono.length !== 8) {
            toast.error({ text: "El número de teléfono debe tener 8 dígitos" });
            return;
        }

        if (passwordStrength < 1) {
            toast.error({ text: "La contraseña debe tener al menos 8 caracteres, una letra y un número" });
            return;
        }

        try {
            const imageFile = base64ToFile(formData.current.imagen, username!);

            const imagen: Image = {
                originalFilename: imageFile.name,
                category: "profile_images",
                file: imageFile,
            };

            const imagenSubida = await uploadImageMutator.mutateAsync(imagen);

            const usuario: ActivateAccountRequirements = {
                telefono: formData.current.telefono,
                password: formData.current.password,
                image: imagenSubida.data.url,
                isActive: true,
            };


            await activateAccountMutator.mutateAsync(usuario);
            setStep(3);
            setActivationStatus("success");

            handleLogout();



        } catch (error) {
            console.error(error);
            setStep(3);
            setActivationStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Completa tu perfil, <span className="text-blue_principal">{username}</span></h1>
                    <div className="flex justify-center items-center mt-4 gap-5">
                        <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    </div>
                </div>

                {step === 1 && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl text-center  font-semibold text-blue_principal mb-6">Imagen de perfil</h2>
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                {preview ? (
                                    <ImagePreview preview={preview} setPreview={setPreview} formData={formData} handleRetakePhoto={handleRetakePhoto} />
                                ) : cameraActive ? (
                                    <CameraPreview videoRef={videoRef} fileInputRef={fileInputRef} isMobile={isMobile} handleFileChange={handleFileChange} handleTakePhoto={handleTakePhoto} stopCamera={stopCamera} />
                                ) : (
                                    <UploadButton fileInputRef={fileInputRef} startCamera={startCamera} isMobile={isMobile} handleFileChange={handleFileChange} />
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
                                disabled={!formData.current.imagen}
                            >
                                Continuar
                            </button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl text-blue_principal font-semibold text-center mb-6">Datos de seguridad</h2>
                        <div className="space-y-6">
                            <PhoneField telefono={telefono} handleTelefonoChange={handleTelefonoChange} />

                            <PasswordField
                                password={password}
                                handlePasswordChange={handlePasswordChange}
                                passwordStrength={passwordStrength}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />

                            <IndicatorStepFinish handlePrevious={handlePrevious} handleFinish={handleFinish} />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl text-center font-semibold text-blue_principal mb-6">
                            {activationStatus === "success" ? "¡Cuenta activada!" : "Error al activar la cuenta"}
                        </h2>
                        <div className="space-y-6">
                            <p className="text-center text-gray-700">
                                {activationStatus === "success"
                                    ? "Listo, has activado tu cuenta."
                                    : "Hubo un error al activar tu cuenta. Por favor, inténtalo más tarde."}
                            </p>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-sm"
                            >
                                {activationStatus === "success" ? "Ingresar con mis credenciales" : "Volver a intentar"}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UpdateRequiredForm;