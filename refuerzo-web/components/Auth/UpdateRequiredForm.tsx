"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Usuario } from "@/types/types";
import { UploadCloud, X, Lock, Check, Eye, EyeOff, Camera } from "lucide-react";

interface UpdateRequiredFormProps {
    user: Usuario;
}

const UpdateRequiredForm: React.FC<UpdateRequiredFormProps> = ({ user }) => {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState<string | null>(user.imagen || null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [rememberPassword, setRememberPassword] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    const formData = useRef({
        imagen: user.imagen || "",
        telefono: user.telefono || "",
        password: "",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Detectar dispositivo móvil
    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    // Limpiar streams al desmontar
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleNext = () => setStep(step + 1);
    const handlePrevious = () => setStep(step - 1);

    const stopCamera = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    const startCamera = useCallback(async () => {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: isMobile ? { exact: "environment" } : "user"
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            mediaStreamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraActive(true);
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            stopCamera();
        }
    }, [isMobile, stopCamera]);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                const { videoWidth, videoHeight } = videoRef.current;
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;
                
                context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
                const imageSrc = canvasRef.current.toDataURL('image/png');
                
                setPreview(imageSrc);
                formData.current.imagen = imageSrc;
                stopCamera();
            }
        }
    }, [stopCamera]);

    const handleRetakePhoto = useCallback(() => {
        setPreview(null);
        formData.current.imagen = "";
        startCamera();
    }, [startCamera]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        stopCamera();
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            formData.current.imagen = reader.result as string;
        };
        reader.readAsDataURL(file);
    }, [stopCamera]);

    const checkPasswordStrength = (password: string) => {
        const strength = [
            password.length > 6,
            password.match(/[A-Z]/),
            password.match(/[0-9]/),
            password.match(/[^A-Za-z0-9]/)
        ].filter(Boolean).length;

        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        formData.current.password = value;
        checkPasswordStrength(value);
    };

    const CameraPreview = () => (
        <div className="relative w-32 h-32 mx-auto">
            <video
                ref={videoRef}
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                muted
                playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <button
                    onClick={capturePhoto}
                    className="p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                    <Camera className="w-6 h-6 text-blue-600" />
                </button>
            </div>
        </div>
    );

    const ImagePreview = () => (
        <div className="relative w-32 h-32 mx-auto">
            <img
                src={preview!}
                alt="Preview"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -top-1 -right-1 flex gap-1">
                <button
                    onClick={handleRetakePhoto}
                    className="p-1 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Camera className="w-4 h-4 text-white" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        formData.current.imagen = "";
                    }}
                    className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );

    const UploadButton = () => (
        <label className="group flex flex-col items-center cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="mt-4 text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                {isMobile ? "Tomar o subir foto" : "Subir imagen"}
            </span>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                capture={isMobile ? "environment" : undefined}
            />
        </label>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Completa tu perfil</h1>
                    <div className="flex justify-center items-center space-x-4">
                        <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    </div>
                </div>

                {step === 1 && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Imagen de perfil</h2>
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                {cameraActive ? (
                                    <CameraPreview />
                                ) : preview ? (
                                    <ImagePreview />
                                ) : (
                                    <UploadButton />
                                )}
                            </div>

                            {!isMobile && (
                                <div className="flex flex-col gap-2">
                                    {!preview && !cameraActive && (
                                        <button
                                            onClick={startCamera}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-sm"
                                        >
                                            Activar cámara
                                        </button>
                                    )}
                                </div>
                            )}

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
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Datos de seguridad</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                                    <Lock className="w-4 h-4" />
                                    Teléfono de contacto
                                </label>
                                <input
                                    type="tel"
                                    value={formData.current.telefono}
                                    onChange={(e) => formData.current.telefono = e.target.value}
                                    placeholder="Ej: +51 987 654 321"
                                    className="w-full px-4 py-3 rounded-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
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
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2 flex-1 rounded-full transition-all ${passwordStrength > i
                                                    ? i < 2 ? 'bg-red-400' : i < 3 ? 'bg-yellow-400' : 'bg-green-500'
                                                    : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {passwordStrength === 0 ? 'Débil' :
                                            passwordStrength < 3 ? 'Medio' : 'Fuerte'}
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