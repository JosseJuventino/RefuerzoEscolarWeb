import { useState, useCallback, useRef, useEffect } from "react";
import { Lock, Check, Eye, EyeOff } from "lucide-react";
import { ImagePreview } from "./ImagePreview";
import { CameraPreview } from "./CameraPreview";
import { UploadButton } from "../Fields/UploadButton";

interface UpdateRequiredFormProps {
    username: string;
}

const UpdateRequiredForm: React.FC<UpdateRequiredFormProps> = ({ username }) => {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [rememberPassword, setRememberPassword] = useState(false);
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





    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Completa tu perfil, <span className="text-blue_principal">{username}</span></h1>
                    <div className="flex justify-center items-center space-x-4">
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
                                        autoComplete={rememberPassword ? "current-password" : "off"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2 flex-1 rounded-full transition-all ${password.length === 0
                                                    ? "bg-gray-200" // Sin contraseña: todas grises
                                                    : passwordStrength === 0
                                                        ? i === 0
                                                            ? "bg-red-500" // Débil: primera barra roja
                                                            : "bg-gray-200" // Las otras grises
                                                        : passwordStrength === 1
                                                            ? i < 2
                                                                ? "bg-yellow-500" // Medio: primeras dos amarillas
                                                                : "bg-gray-200" // La tercera gris
                                                            : "bg-green-500" // Fuerte: todas verdes
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
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberPassword}
                                        onChange={(e) => setRememberPassword(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all
                                        ${rememberPassword ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                        {rememberPassword && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                                Recordar contraseña
                            </label>

                            <div className="flex gap-4">
                                <button
                                    onClick={handlePrevious}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={() => console.log("Datos actualizados:", { ...formData.current, rememberPassword })}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-all"
                                >
                                    Finalizar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateRequiredForm;