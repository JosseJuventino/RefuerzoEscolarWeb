import { useState, useCallback, useRef, useEffect } from "react";
import { PasswordField } from "../Fields/PasswordField";
import { ImagePreview } from "./ImagePreview";
import { CameraPreview } from "./CameraPreview";
import IndicatorStepFinish from "./IndicatorStep";
import { UploadButton } from "../Fields/UploadButton";

import { PhoneField } from "../Fields/PhoneField";

interface UpdateRequiredFormProps {
    username: string;
}

const UpdateRequiredForm: React.FC<UpdateRequiredFormProps> = ({ username }) => {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");

    const formData = useRef({
        imagen: "",
        telefono: "",
        password: "",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    useEffect(() => {
        formData.current.telefono = `+503${telefono}`;
    }, [telefono]);

    useEffect(() => {
        formData.current.password = password;
    }, [password]);

    const handleNext = () => setStep(step + 1);
    const handlePrevious = () => setStep(step - 1);

    const stopCamera = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            mediaStreamRef.current = null;
        }

        setCameraActive(false);
    }, []);

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
        const value = e.target.value.replace(/\D/g, ''); // Eliminar todos los caracteres que no sean dígitos
        if (value.length <= 8) {
            setTelefono(value);
        }
    };

    const startCamera = useCallback(async () => {
        try {
            setCameraActive(true);
            abortControllerRef.current = new AbortController();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: isMobile ? "environment" : "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

        } catch (error) {
            console.error("Error al iniciar cámara:", error);
            setCameraActive(false);
            stopCamera();
        }
    }, [isMobile, stopCamera]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            formData.current.imagen = reader.result as string;
            stopCamera();
        };
        reader.readAsDataURL(file);
    }, [stopCamera]);

    const handleTakePhoto = useCallback(() => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL('image/png');
                setPreview(dataUrl);
                formData.current.imagen = dataUrl;
                stopCamera();
            }
        }
    }, [stopCamera]);

    const handleRetakePhoto = useCallback(() => {
        setPreview(null);
        formData.current.imagen = "";
        startCamera();
    }, [startCamera]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordStrength(validatePassword(value));
    }

    const handleFinish = () => {
        console.log("Datos actualizados:", { ...formData.current });
    }



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
            </div>
        </div>
    );
};

export default UpdateRequiredForm;