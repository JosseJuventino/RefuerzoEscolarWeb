"use client";

import { Header } from "@/components/Form/FormHeader";
import { ImagePreview } from "@/components/Auth/ImagePreview";
import { useRouter } from "next/navigation";
import { CameraPreview } from "@/components/Auth/CameraPreview";
import { useEffect, useState, useRef } from "react";
import { UploadButton } from "@/components/Fields/UploadButton";
import InputField from "@/components/Fields/InputFieldValidate";
import { useCamera } from "@/hooks/useCamera";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPrograms } from "@/services/programs.service";
import { getGrades } from "@/services/grades.service";
import SelectField from "@/components/Fields/SelectField";
import { useForm, SubmitHandler, } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { AuthService } from "@/services/auth.service";
import { Loading } from "@/components/Loading";
import { Grade, Image, Program } from "@/types/types";
import { addPostulante } from "@/services/applicants.service";
import { uploadImage } from "@/services/images.service";
import { base64ToFile } from "@/utils/base64ToFile";

interface FormValues {
    nombre: string;
    email: string;
    direccion: string;
    telefono: string;
    grado: string;
    programa: string;
}


export default function RegistrationForm() {
    const router = useRouter();

    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [preview, setPreview] = useState<string | null>(null);

    const isMobile = () => {
        if (typeof window !== 'undefined') {
            return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        }
        return false; // Valor predeterminado si no está en el cliente
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        trigger,
    } = useForm<FormValues>({
        defaultValues: {
            nombre: "",
            email: "",
            direccion: "",
            telefono: "",
            grado: "",
            programa: "",
        },
    });

    const { data: programs } = useQuery<Program[], Error>({
        queryKey: ["programas"],
        queryFn: getPrograms,
    });

    const { data: grades } = useQuery<Grade[], Error>({
        queryKey: ["grados"],
        queryFn: getGrades,
    });
    const formData = useRef({
        imagen: "",
    });

    const { cameraActive, startCamera, stopCamera, videoRef, canvasRef, handleTakePhoto, handleFileChange, handleRetakePhoto } = useCamera(isMobile, setPreview, formData);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await AuthService.checkAuth();
            if (!isAuthenticated) {
                router.push("/");
            } else {
                setIsChecking(false);
            }
        };
        checkAuth();
    }, [router]);


    const addPostulant = useMutation({
        mutationFn: addPostulante,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postulante'] });
        },
    });

    const uploadImageMutator = useMutation({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['image'] });
        },
    });


    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {

            const imageFile = base64ToFile(formData.current.imagen, data.nombre);

            const imagen: Image = {
                originalFilename: imageFile.name,
                category: "profile_images",
                file: imageFile,
            };

            const imagenSubida = await uploadImageMutator.mutateAsync(imagen);

            const postulanteData = {
                ...data,
                imagen: imagenSubida.data.url,
                isUser: false
            };

            const response = await addPostulant.mutateAsync(postulanteData);

            console.log(response);
            router.push("/dashboard/postulantes/sucess");
        } catch {
            toast.error("Error al enviar el formulario");
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                toast.error(error?.message || "Error de validación");
            });
        }
    }, [errors]);


    if (isChecking) {
        return <Loading />;
    }

    const gradeOptions = grades?.map((grade) => ({
        value: grade._id,
        label: grade.nombre,
    })) || [];

    const programOptions = programs?.map((program) => ({
        value: program._id,
        label: program.nombre,
    })) || [];

    return (
        <main className="w-full h-full bg-gray-50">
            <Toaster position="top-right" />
            <div className="max-w-[600px] mx-auto p-8 md:p-4">
                <Header />

                <div className="p-8 md:p-4">
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex justify-center">
                            {preview ? (
                                <ImagePreview preview={preview} setPreview={setPreview} formData={formData} handleRetakePhoto={handleRetakePhoto} />
                            ) : cameraActive ? (
                                <CameraPreview videoRef={videoRef} fileInputRef={fileInputRef} isMobile={isMobile} handleFileChange={handleFileChange} handleTakePhoto={handleTakePhoto} stopCamera={stopCamera} />
                            ) : (
                                <UploadButton fileInputRef={fileInputRef} startCamera={startCamera} isMobile={isMobile} handleFileChange={handleFileChange} />
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <InputField
                            label="Nombre Completo"
                            id="nombre"
                            placeholder="Ingrese su nombre completo"
                            register={register}
                            validation={{
                                required: "El nombre completo es requerido",
                                minLength: {
                                    value: 5,
                                    message: "Mínimo 5 caracteres",
                                },
                            }}
                            trigger={trigger}
                            error={errors.nombre?.message}
                        />


                        <InputField
                            label="Correo Electrónico"
                            id="email"
                            type="email"
                            placeholder="Ingrese su correo electrónico"
                            register={register}
                            validation={{
                                required: "El correo electrónico es requerido",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Correo electrónico inválido",
                                },
                            }}
                            trigger={trigger}
                            error={errors.email?.message}
                        />

                        <InputField
                            label="Dirección:"
                            id="direccion"
                            placeholder="Ingrese la direccion donde vive"
                            register={register}
                            validation={{
                                required: "La dirección es requerida",
                            }}
                            trigger={trigger}
                            error={errors.direccion?.message}
                        />

                        <InputField
                            label="Número de contacto"
                            id="telefono"
                            type="tel"
                            placeholder="Ingrese el número de contacto"
                            register={register}
                            validation={{
                                required: "El número de contacto es requerido",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Número inválido (10 dígitos requeridos)",
                                },
                            }}
                            trigger={trigger}
                            error={errors.telefono?.message}
                        />

                        <SelectField
                            label="Grado"
                            id="grado"
                            register={register}
                            options={gradeOptions}
                            validation={{
                                required: "Debes seleccionar un grado",
                            }}
                            error={errors.grado?.message}
                            trigger={trigger}
                        />

                        <SelectField
                            label="Programa"
                            id="programa"
                            register={register}
                            options={programOptions}
                            validation={{
                                required: "Debes seleccionar un programa",
                            }}
                            error={errors.programa?.message}
                            trigger={trigger}
                        />

                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#003C71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#00509E] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Enviando..." : "Enviar Aplicación"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}